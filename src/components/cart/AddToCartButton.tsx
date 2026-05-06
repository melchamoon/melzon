'use client';

import { useState } from 'react';
import { readCart, writeCart } from '@/lib/storage';
import { addItem } from '@/lib/cart';
import { Button } from '@/components/ui/button';

export function AddToCartButton({ productId }: { productId: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    writeCart(addItem(readCart(), productId, qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="text-fg-muted text-sm">数量:</label>
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="bg-white border border-[color:var(--color-line-strong)] text-fg rounded-[3px] px-2 py-1 text-sm"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={handleAdd} variant="primary" size="lg" className="w-full">
        {added ? '✓ カートに追加しました' : 'カートに入れる'}
      </Button>
    </div>
  );
}
