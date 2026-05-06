'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pickRandom } from '@/lib/recommend';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types/product';

type Props = {
  featuredProducts: Product[];
  foodProducts: Product[];
  gadgetProducts: Product[];
};

export function SpotlightPair({ featuredProducts, foodProducts, gadgetProducts }: Props) {
  const [featured, setFeatured] = useState<Product | null>(featuredProducts[0] ?? null);
  const [food, setFood] = useState<Product | null>(foodProducts[0] ?? null);
  const [gadget, setGadget] = useState<Product | null>(gadgetProducts[0] ?? null);

  useEffect(() => {
    const [f] = pickRandom(featuredProducts, 1);
    const [d] = pickRandom(foodProducts, 1);
    const [g] = pickRandom(gadgetProducts, 1);
    if (f) setFeatured(f);
    if (d) setFood(d);
    if (g) setGadget(g);
  }, [featuredProducts, foodProducts, gadgetProducts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <section>
        <h2 className="text-xl font-bold text-fg mb-4">今売れてます</h2>
        {featured && (
          <div className="max-w-xs">
            <ProductCard product={featured} />
          </div>
        )}
        <Link href="/bestsellers" className="text-sm text-blue-600 mt-2 inline-block">もっと見る</Link>
      </section>
      <section>
        <h2 className="text-xl font-bold text-fg mb-4">注目の食品情報</h2>
        {food && (
          <div className="max-w-xs">
            <ProductCard product={food} />
          </div>
        )}
        <Link href="/categories/food" className="text-sm text-blue-600 mt-2 inline-block">もっと見る</Link>
      </section>
      <section>
        <h2 className="text-xl font-bold text-fg mb-4">最新ガジェット特集</h2>
        {gadget && (
          <div className="max-w-xs">
            <ProductCard product={gadget} />
          </div>
        )}
        <Link href="/categories/gadget" className="text-sm text-blue-600 mt-2 inline-block">もっと見る</Link>
      </section>
    </div>
  );
}
