'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { pickProductImage } from '@/lib/product-image';

export function ProductHeroImage({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  useEffect(() => { setImgSrc(pickProductImage(product)); }, [product]);

  if (!imgSrc) return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );
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
