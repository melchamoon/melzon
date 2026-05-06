'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { formatPoints } from '@/lib/format';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-ink-900 border border-gold-900 rounded-lg overflow-hidden hover:border-gold-600 transition-colors"
    >
      <div className="relative aspect-square bg-ink-950">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4"
          unoptimized
          onError={() => {}}
        />
      </div>
      <div className="p-3">
        <p className="text-gold-200 text-sm line-clamp-2 leading-snug mb-2">{product.name}</p>
        <div className="text-gold-400 text-xs mb-1">★★★★★</div>
        <p className="text-gold-500 font-semibold text-sm">{formatPoints(product.price)} pt</p>
      </div>
    </Link>
  );
}
