'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { earnPointsLocal } from '@/lib/points';
import { pickProductImage } from '@/lib/product-image';
import { usePoints } from '@/lib/use-storage';
import { payoutByMisses } from '@/lib/memory';
import { formatPoints } from '@/lib/format';
import type { Product } from '@/types/product';
import Link from 'next/link';

type MemoryCard = {
  id: number;
  symbol: string;
  image: string;
  matched: boolean;
  flipped: boolean;
};

function initCards(products: Product[], pickImage: (p: Product) => string): MemoryCard[] {
  const pairs: MemoryCard[] = [];
  products.slice(0, 6).forEach((p, i) => {
    const img = pickImage(p);
    pairs.push({ id: i * 2,     symbol: p.id, image: img, matched: false, flipped: false });
    pairs.push({ id: i * 2 + 1, symbol: p.id, image: img, matched: false, flipped: false });
  });
  return pairs;
}

function shuffleCards(cards: MemoryCard[]): MemoryCard[] {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function Memory({ products }: { products: Product[] }) {
  const balance = usePoints();
  const [cards, setCards] = useState(() => initCards(products, (p) => p.images[0]!));
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    setCards(shuffleCards(initCards(products, pickProductImage)));
    products.slice(0, 6).forEach((p) => {
      const img = new window.Image();
      img.src = pickProductImage(p);
    });
  }, [products]);
  const [misses, setMisses] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [processing, setProcessing] = useState(false);

  const flipCard = useCallback(
    async (id: number) => {
      if (processing) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.matched || card.flipped) return;
      if (selected.length >= 2) return;

      const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
      const newSelected = [...selected, id];
      setCards(newCards);
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setProcessing(true);
        const [id1, id2] = newSelected as [number, number];
        const c1 = newCards.find((c) => c.id === id1)!;
        const c2 = newCards.find((c) => c.id === id2)!;

        if (c1.symbol === c2.symbol) {
          const matched = newCards.map((c) =>
            c.id === id1 || c.id === id2 ? { ...c, matched: true } : c,
          );
          setCards(matched);
          setSelected([]);
          setProcessing(false);
          if (matched.every((c) => c.matched)) {
            earnPointsLocal(payoutByMisses(misses));
            setCleared(true);
          }
        } else {
          await new Promise((r) => setTimeout(r, 700));
          setCards(newCards.map((c) => (c.id === id1 || c.id === id2 ? { ...c, flipped: false } : c)));
          setSelected([]);
          setMisses((m) => m + 1);
          setProcessing(false);
        }
      }
    },
    [cards, selected, misses, processing],
  );

  const restart = useCallback(() => {
    setCards(shuffleCards(initCards(products, pickProductImage)));
    setSelected([]);
    setMisses(0);
    setCleared(false);
  }, [products]);

  const verdict = clearVerdict(misses);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-4xl mx-auto w-full">
      <div className="flex flex-col items-center gap-6 flex-1 w-full bg-black border-2 border-red-900/70 shadow-[0_0_24px_rgba(127,0,0,0.4)] p-5">
        <div className="w-full text-center">
          <div className="text-[10px] tracking-[0.5em] text-red-500/80 font-bold">― 限定 神経衰弱 ―</div>
          <div className="mt-1 text-xs tracking-[0.3em] text-zinc-400">記憶を、賭けろ。</div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-mono">
          <span className="text-zinc-300">ペナルティ: <span className="text-red-400 font-bold">{misses}</span></span>
          <span className="text-amber-300 font-bold">配当: {formatPoints(payoutByMisses(misses))} pt</span>
          <span className="text-zinc-400">所持: {formatPoints(balance)} pt</span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              disabled={card.matched || card.flipped || processing}
              aria-label={card.flipped || card.matched ? `カード ${card.symbol}` : '裏向きのカード'}
              data-testid={`memory-card-${card.id}`}
              className={`w-24 h-24 md:w-32 md:h-32 transition-all relative ${
                card.matched
                  ? 'border-2 border-amber-500 bg-amber-950/40 shadow-[inset_0_0_12px_rgba(251,191,36,0.3)]'
                  : card.flipped
                    ? 'border-2 border-amber-400 bg-zinc-100 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                    : 'hover:shadow-[0_0_16px_rgba(220,38,38,0.6)] cursor-pointer'
              }`}
            >
              {card.flipped || card.matched ? (
                <div className="relative w-full h-full p-2">
                  <Image src={card.image} alt={card.symbol} fill className="object-contain p-2" unoptimized />
                </div>
              ) : (
                <Image
                  src="/games/memory/card.png"
                  alt="裏向きのカード"
                  fill
                  className="object-contain"
                  unoptimized
                />
              )}
            </button>
          ))}
        </div>

      </div>

      <div className="w-full lg:w-64 shrink-0 bg-black/80 backdrop-blur-sm border-2 border-amber-700/60 p-4 shadow-[0_0_16px_rgba(180,83,9,0.3)]">
        <h3 className="text-amber-400 font-black tracking-[0.3em] mb-3 text-center border-b border-amber-700/50 pb-2 text-sm">
          配 当 表
        </h3>
        <div className="space-y-1 text-sm font-mono">
          {[0, 1, 2, 3, 4, 5, 6].map((m) => (
            <div
              key={m}
              className={`flex justify-between py-1.5 px-3 transition-colors ${
                misses === m && !cleared
                  ? 'bg-red-900/60 border border-amber-500 text-amber-200 font-bold shadow-[inset_0_0_8px_rgba(251,191,36,0.3)]'
                  : 'text-zinc-500'
              }`}
            >
              <span>{m === 0 ? '完全勝利' : `失策 ${m}`}</span>
              <span>{formatPoints(payoutByMisses(m))}</span>
            </div>
          ))}
          <div
            className={`flex justify-between py-1.5 px-3 transition-colors ${
              misses >= 7 && !cleared
                ? 'bg-red-900/60 border border-amber-500 text-amber-200 font-bold'
                : 'text-zinc-600'
            }`}
          >
            <span>失策 7+</span>
            <span>{formatPoints(payoutByMisses(7))}</span>
          </div>
        </div>
        <p className="mt-3 pt-3 border-t border-amber-900/40 text-[10px] text-zinc-500 leading-relaxed text-center italic">
          ※ 失策一つにつき<br />配当は容赦なく削られる
        </p>
      </div>

      <Dialog open={cleared}>
        <DialogContent className="bg-gradient-to-b from-zinc-950 to-black border-2 border-amber-500 text-zinc-100 shadow-[0_0_40px_rgba(251,191,36,0.5)]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black tracking-[0.2em] text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
              {verdict.title}
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-300 mt-2">
              {verdict.subtitle}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center font-mono text-sm space-y-1 mt-2">
            <p className="text-zinc-400">失策 <span className="text-red-400 font-bold">{misses}</span></p>
            <p className="text-amber-300 text-lg font-bold">獲得配当 {formatPoints(payoutByMisses(misses))} pt</p>
            <p className="text-zinc-500 text-xs">所持 {formatPoints(balance)} pt</p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={restart} variant="primary">もう一勝負</Button>
            <Button variant="secondary" asChild>
              <Link href="/">ストアに戻る</Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="/cart">カートを見る</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function clearVerdict(misses: number): { title: string; subtitle: string } {
  if (misses === 0) return { title: '圧倒的 … 勝利 … ！', subtitle: '神の領域 … 記憶の覇者である … ！' };
  if (misses <= 2) return { title: '完 全 制 圧 ！', subtitle: '見事な集中力 … 並の勝負師ではない … ！' };
  if (misses <= 4) return { title: '勝 利 … ！', subtitle: '辛うじて … 摑み取った勝利 … ！' };
  if (misses <= 6) return { title: 'ギリギリ … 凌いだ … ！', subtitle: '配当は薄い … が、生き残った … ！' };
  return { title: '辛 勝 … 。', subtitle: '次は … もっと冷静になれ … 。' };
}
