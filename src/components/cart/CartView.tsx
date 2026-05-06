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
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-fg mb-6">カート</h1>

      {isEmpty ? (
        <div className="text-center py-12 bg-white border border-[color:var(--color-line)] p-8">
          <p className="text-fg-muted mb-4">カートは空です</p>
          <Button asChild variant="primary">
            <Link href="/">ストアに戻る</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
          <div className="bg-white border border-[color:var(--color-line)] p-4">
            <h2 className="text-lg font-bold text-fg mb-2 border-b border-[color:var(--color-line)] pb-2">
              ショッピングカート
            </h2>
            {cartWithProducts.map(({ item, product }) => (
              <CartItem key={item.id} item={item} product={product} />
            ))}
          </div>

          <div className="bg-white border border-[color:var(--color-line)] p-4 h-fit sticky top-[120px] space-y-3">
            <p className="text-fg text-sm">
              小計（{cartWithProducts.length}点）:{' '}
              <span className="font-bold text-price" data-testid="cart-total">
                {formatPoints(total)} pt
              </span>
            </p>
            <p className="text-xs text-fg-muted">残高: {formatPoints(points)} pt</p>
            <Button asChild size="lg" variant="primary" className="w-full">
              <Link href="/checkout">めるちゃもへプレゼントする</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
