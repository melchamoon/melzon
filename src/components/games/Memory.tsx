'use client';

import { useState, useCallback } from 'react';
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
  return pairs.sort(() => Math.random() - 0.5);
}

export function Memory({ products }: { products: Product[] }) {
  const balance = usePoints();
  const [cards, setCards] = useState(() => initCards(products));
  const [selected, setSelected] = useState<number[]>([]);
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
    setCards(initCards(products));
    setSelected([]);
    setMisses(0);
    setCleared(false);
  }, [products]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 text-sm text-gold-300">
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
            className={`w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 transition-all ${
              card.matched
                ? 'border-gold-500 bg-gold-900/30'
                : card.flipped
                  ? 'border-gold-400 bg-ink-900'
                  : 'border-gold-800 bg-ink-950 hover:border-gold-600 cursor-pointer'
            }`}
          >
            {card.flipped || card.matched ? (
              <div className="relative w-full h-full p-2">
                <Image src={card.image} alt={card.symbol} fill className="object-contain p-2" unoptimized />
              </div>
            ) : (
              <span className="text-2xl text-gold-700">？</span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={cleared}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 クリア！</DialogTitle>
            <DialogDescription>
              ミス {misses} 回 → {formatPoints(payoutByMisses(misses))} ポイント獲得！
            </DialogDescription>
          </DialogHeader>
          <p className="text-gold-300 text-center text-sm mt-2">
            残高: {formatPoints(balance)} pt
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={restart}>もう一度</Button>
            <Button variant="outline-gold" asChild>
              <Link href="/">ストアに戻る</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/cart">カートを見る</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
