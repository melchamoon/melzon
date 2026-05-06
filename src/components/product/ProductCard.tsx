'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { pickProductImage } from '@/lib/product-image';
import { formatPoints } from '@/lib/format';
import { RatingStars } from '@/components/ui/RatingStars';

export function ProductCard({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState(product.images[0]);
  useEffect(() => { setImgSrc(pickProductImage(product)); }, [product]);

  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-white border border-[color:var(--color-line)] rounded-sm overflow-hidden hover:shadow-[0_0_0_1px_var(--color-cta)] transition-shadow"
    >
      <div className="relative aspect-square bg-white">
        <Image
          src={imgSrc!}
          alt={product.name}
          fill
          className="object-contain p-2"
          unoptimized
          onError={() => {}}
        />
      </div>
      <div className="p-3 space-y-1">
        <p className="text-fg text-sm leading-snug line-clamp-2 hover:text-link-hover">
          {product.name}
        </p>
        <RatingStars value={5} reviewCount={product.reviews.length} />
        <p data-testid="product-price" className="text-price font-bold">
          <span className="text-lg">{formatPoints(product.price)}</span>
          <span className="text-xs ml-1 text-fg-muted">pt</span>
        </p>
      </div>
    </Link>
  );
}
