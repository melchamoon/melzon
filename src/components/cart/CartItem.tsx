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
    <div className="flex gap-4 py-4 border-b border-[color:var(--color-line)]">
      <div className="relative w-20 h-20 bg-white border border-[color:var(--color-line)] rounded-sm shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-link hover:text-link-hover hover:underline text-sm mb-1 cursor-pointer">
          {product.name}
        </p>
        <p className="text-price font-bold text-sm mb-2">{formatPoints(product.price)} pt</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => writeCart(updateQty(readCart(), item.id, item.qty - 1))}
            className="w-7 h-7 border border-[color:var(--color-line-strong)] rounded-sm text-fg hover:bg-surface flex items-center justify-center text-sm"
          >
            −
          </button>
          <span className="text-fg text-sm w-8 text-center">{item.qty}</span>
          <button
            type="button"
            onClick={() => writeCart(updateQty(readCart(), item.id, item.qty + 1))}
            className="w-7 h-7 border border-[color:var(--color-line-strong)] rounded-sm text-fg hover:bg-surface flex items-center justify-center text-sm"
          >
            ＋
          </button>
          <button
            type="button"
            onClick={() => writeCart(removeItem(readCart(), item.id))}
            className="ml-auto text-link hover:text-link-hover text-xs hover:underline"
          >
            削除
          </button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-price text-sm font-bold">
          {formatPoints(product.price * item.qty)} pt
        </p>
      </div>
    </div>
  );
}
