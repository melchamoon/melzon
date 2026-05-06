'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { earnPointsLocal } from '@/lib/points';
import { usePoints } from '@/lib/use-storage';
import { payoutByMisses } from '@/lib/slot';
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

function initCards(products: Product[]): MemoryCard[] {
  const pairs: MemoryCard[] = [];
  products.slice(0, 6).forEach((p, i) => {
    pairs.push({ id: i * 2, symbol: p.id, image: p.image, matched: false, flipped: false });
    pairs.push({ id: i * 2 + 1, symbol: p.id, image: p.image, matched: false, flipped: false });
  });
  return pairs;
}

function shuffleCards(cards: MemoryCard[]): MemoryCard[] {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function Memory({ products }: { products: Product[] }) {
  const balance = usePoints();
  const [cards, setCards] = useState(() => initCards(products));
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    setCards(shuffleCards(initCards(products)));
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
    setCards(shuffleCards(initCards(products)));
    setSelected([]);
    setMisses(0);
    setCleared(false);
  }, [products]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-4xl mx-auto w-full">
      <div className="flex flex-col items-center gap-6 flex-1 w-full bg-white border border-[color:var(--color-line)] p-4">
        <div className="flex gap-4 text-sm text-fg">
          <span>ミス: {misses} 回</span>
          <span>残高: {formatPoints(balance)} pt</span>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              disabled={card.matched || card.flipped || processing}
              aria-label={card.flipped || card.matched ? `カード ${card.symbol}` : '裏向きのカード'}
              data-testid={`memory-card-${card.id}`}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-sm border-2 transition-all ${
                card.matched
                  ? 'border-[color:var(--color-success)] bg-[color:var(--color-surface)]'
                  : card.flipped
                    ? 'border-[color:var(--color-cta)] bg-white'
                    : 'border-[color:var(--color-line-strong)] bg-nav-sub hover:border-[color:var(--color-cta)] cursor-pointer'
              }`}
            >
              {card.flipped || card.matched ? (
                <div className="relative w-full h-full p-2">
                  <Image src={card.image} alt={card.symbol} fill className="object-contain p-2" unoptimized />
                </div>
              ) : (
                <span className="text-2xl text-white">？</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-64 shrink-0 bg-surface-soft border border-[color:var(--color-line)] p-4">
        <h3 className="text-fg font-bold mb-3 text-center border-b border-[color:var(--color-line)] pb-2">報酬一覧</h3>
        <div className="space-y-1 text-sm font-mono">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
            <div
              key={m}
              className={`flex justify-between py-1.5 px-3 rounded-sm transition-colors ${
                misses === m && !cleared
                  ? 'bg-cta-yellow border border-[color:var(--color-cta-yellow-border)] text-fg font-bold'
                  : 'text-fg-muted'
              }`}
            >
              <span>{m} ミス</span>
              <span>{formatPoints(payoutByMisses(m))} pt</span>
            </div>
          ))}
          <div
            className={`flex justify-between py-1.5 px-3 rounded-sm transition-colors ${
              misses >= 10 && !cleared
                ? 'bg-cta-yellow border border-[color:var(--color-cta-yellow-border)] text-fg font-bold'
                : 'text-fg-muted'
            }`}
          >
            <span>10+ ミス</span>
            <span>{formatPoints(payoutByMisses(10))} pt</span>
          </div>
        </div>
      </div>

      <Dialog open={cleared}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 クリア！</DialogTitle>
            <DialogDescription>
              ミス {misses} 回 → {formatPoints(payoutByMisses(misses))} ポイント獲得！
            </DialogDescription>
          </DialogHeader>
          <p className="text-fg-muted text-center text-sm mt-2">
            残高: {formatPoints(balance)} pt
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={restart} variant="primary">もう一度</Button>
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
