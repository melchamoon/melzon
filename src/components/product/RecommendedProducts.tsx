'use client';

import { useState, useEffect } from 'react';
import { pickRandom } from '@/lib/recommend';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { Product } from '@/types/product';

export function RecommendedProducts({ products }: { products: Product[] }) {
  const [displayed, setDisplayed] = useState<Product[]>(() => products.slice(0, 12));

  useEffect(() => {
    setDisplayed(pickRandom(products, 12));
  }, [products]);

  return <ProductGrid products={displayed} />;
}
