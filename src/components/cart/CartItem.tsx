'use client';

import Image from 'next/image';
import { formatPoints } from '@/lib/format';
import { readCart, writeCart } from '@/lib/storage';
import { updateQty, removeItem } from '@/lib/cart';
import type { Product } from '@/types/product';
import type { CartItem as CartItemType } from '@/types/cart';

type Props = {
  item: CartItemType;
  product: Product;
};

export function CartItem({ item, product }: Props) {
  return (
    <div className="flex gap-4 py-4 border-b border-gold-900">
      <div className="relative w-20 h-20 bg-ink-950 rounded shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gold-200 text-sm mb-1">{product.name}</p>
        <p className="text-gold-500 text-sm mb-2">{formatPoints(product.price)} pt</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => writeCart(updateQty(readCart(), item.id, item.qty - 1))}
            className="w-7 h-7 border border-gold-700 rounded text-gold-400 hover:bg-ink-900 flex items-center justify-center text-sm"
          >
            −
          </button>
          <span className="text-gold-200 text-sm w-8 text-center">{item.qty}</span>
          <button
            type="button"
            onClick={() => writeCart(updateQty(readCart(), item.id, item.qty + 1))}
            className="w-7 h-7 border border-gold-700 rounded text-gold-400 hover:bg-ink-900 flex items-center justify-center text-sm"
          >
            ＋
          </button>
          <button
            type="button"
            onClick={() => writeCart(removeItem(readCart(), item.id))}
            className="ml-auto text-ruby text-xs hover:text-red-400"
          >
            削除
          </button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-gold-400 text-sm font-semibold">
          {formatPoints(product.price * item.qty)} pt
        </p>
      </div>
    </div>
  );
}
