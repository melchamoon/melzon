'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { pickProductImage } from '@/lib/product-image';

export function ProductHeroImage({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  useEffect(() => { setImgSrc(pickProductImage(product)); }, [product]);

  if (!imgSrc) return null;
  return (
    <Image
      src={imgSrc}
      alt={product.name}
      width={0}
      height={0}
      sizes="100vw"
      className="w-full h-full object-contain"
      unoptimized
      priority
    />
  );
}
