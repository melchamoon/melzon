'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatPoints } from '@/lib/format';
import { useCart, usePoints } from '@/lib/use-storage';
import { readPoints, writePoints, writeLastOrder, writeCart } from '@/lib/storage';
import type { Product } from '@/types/product';
import type { PresentSummary } from '@/types/game';

export function CheckoutView({ products }: { products: Product[] }) {
  const router = useRouter();
  const cart = useCart();
  const points = usePoints();
  const [mounted, setMounted] = useState(false);
  const navigatingRef = useRef(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && cart.items.length === 0 && !navigatingRef.current) {
      router.replace('/cart');
    }
  }, [mounted, cart.items.length, router]);

  if (!mounted) return null;
  if (cart.items.length === 0) return null;

  const cartWithProducts = cart.items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return product ? { ...item, name: product.name, price: product.price } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = cartWithProducts.reduce((s, i) => s + i.price * i.qty, 0);
  const shortage = total - points;
  const canAfford = points >= total;

  function handlePresent() {
    if (!canAfford) return;
    navigatingRef.current = true;
    const summary: PresentSummary = {
      items: cartWithProducts.map((c) => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
      totalPoints: total,
    };
    writePoints(readPoints() - total);
    writeLastOrder(summary);
    writeCart({ items: [] });
    router.push('/complete');
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-2xl font-display text-gold-400">プレゼント確認</h1>

      <div className="bg-ink-900 border border-gold-700 rounded-xl p-6 space-y-4">
        <h2 className="text-gold-400 font-semibold">お届け先</h2>
        <p className="text-gold-300 text-lg font-display">めるちゃも</p>
        <p className="text-ink-400 text-xs">（変更不可）</p>
      </div>

      <div className="bg-ink-900 border border-gold-800 rounded-xl p-6 space-y-3">
        <h2 className="text-gold-400 font-semibold mb-2">注文内容</h2>
        {cartWithProducts.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-gold-200">
            <span>{item.name} ×{item.qty}</span>
            <span>{formatPoints(item.price * item.qty)} pt</span>
          </div>
        ))}
        <div className="border-t border-gold-900 pt-3 flex justify-between font-semibold text-gold-400">
          <span>合計</span>
          <span data-testid="checkout-total">{formatPoints(total)} pt</span>
        </div>
        <div className="flex justify-between text-sm text-gold-300">
          <span>残高</span>
          <span data-testid="checkout-balance">{formatPoints(points)} pt</span>
        </div>
        {!canAfford && (
          <div
            className="bg-ruby/20 border border-ruby rounded-lg p-3 text-ruby text-sm"
            data-testid="shortage-notice"
          >
            ポイントが {formatPoints(shortage)} ポイント足りません
          </div>
        )}
      </div>

      {canAfford ? (
        <Button
          type="button"
          size="lg"
          className="w-full"
          data-testid="present-button"
          onClick={handlePresent}
        >
          めるちゃもにプレゼントする
        </Button>
      ) : (
        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/games">ミニゲームでポイントを稼ぐ</Link>
          </Button>
          <Button variant="outline-gold" asChild className="w-full">
            <Link href="/cart">カートに戻る</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
