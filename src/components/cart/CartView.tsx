'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CartItem } from '@/components/cart/CartItem';
import { Button } from '@/components/ui/button';
import { formatPoints } from '@/lib/format';
import { useCart, usePoints } from '@/lib/use-storage';
import type { Product } from '@/types/product';

export function CartView({ products }: { products: Product[] }) {
  const cart = useCart();
  const points = usePoints();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const cartWithProducts = cart.items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return product ? { item, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = cartWithProducts.reduce((s, { item, product }) => s + product.price * item.qty, 0);
  const isEmpty = cartWithProducts.length === 0;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display text-gold-400 mb-8">カート</h1>

      {isEmpty ? (
        <div className="text-center py-12">
          <p className="text-gold-300 mb-4">カートは空です</p>
          <Button asChild>
            <Link href="/">ストアに戻る</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cartWithProducts.map(({ item, product }) => (
              <CartItem key={item.id} item={item} product={product} />
            ))}
          </div>

          <div className="bg-ink-900 border border-gold-800 rounded-xl p-4 h-fit space-y-4">
            <h2 className="text-gold-400 font-semibold">注文サマリ</h2>
            <div className="space-y-2 text-sm">
              {cartWithProducts.map(({ item, product }) => (
                <div key={item.id} className="flex justify-between text-gold-200">
                  <span className="truncate mr-2">{product.name} ×{item.qty}</span>
                  <span className="shrink-0">{formatPoints(product.price * item.qty)} pt</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gold-900 pt-3 flex justify-between font-semibold text-gold-400">
              <span>合計</span>
              <span data-testid="cart-total">{formatPoints(total)} pt</span>
            </div>
            <div className="text-xs text-ink-400">
              残高: {formatPoints(points)} pt
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">めるちゃもへプレゼントする</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
