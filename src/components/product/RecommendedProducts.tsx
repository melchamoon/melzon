'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { pickRandom } from '@/lib/recommend';
import { pickProductImage } from '@/lib/product-image';
import { formatPoints } from '@/lib/format';
import { RatingStars } from '@/components/ui/RatingStars';
import type { Product } from '@/types/product';

type Props = {
  products: Product[];
  count?: number;
};

export function RecommendedProducts({ products, count = 6 }: Props) {
  const [displayed, setDisplayed] = useState<Product[]>(() => products.slice(0, count));

  useEffect(() => {
    setDisplayed(pickRandom(products, count));
  }, [products, count]);

  return (
    <div className="bg-white border border-[color:var(--color-line)] p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayed.map((product) => (
          <RecommendedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function RecommendedProductCard({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState(product.images[0]);
  useEffect(() => { setImgSrc(pickProductImage(product)); }, [product]);

  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-white border border-[color:var(--color-line)] rounded-sm overflow-hidden hover:shadow-[0_0_0_1px_var(--color-cta)] transition-shadow"
    >
      <div className="relative aspect-square bg-white w-full">
        <Image
          src={imgSrc!}
          alt={product.name}
          fill
          className="object-contain p-2"
          unoptimized
          onError={() => {}}
        />
      </div>
      <div className="p-2 space-y-1">
        <p className="text-fg text-xs leading-snug line-clamp-2">{product.name}</p>
        <RatingStars value={5} reviewCount={product.reviews.length} />
        <p className="text-price font-bold text-sm">
          {formatPoints(product.price)}
          <span className="text-xs ml-1 text-fg-muted">pt</span>
        </p>
      </div>
    </Link>
  );
}
