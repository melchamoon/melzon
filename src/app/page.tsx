'use client';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts, getFeaturedProducts, getProductsByCategory } from '@/lib/products';
import { BannerCarousel } from '@/components/layout/BannerCarousel';
import { PageShell } from '@/components/layout/PageShell';
import { RecommendedProducts } from '@/components/product/RecommendedProducts';
import { SpotlightPair } from '@/components/product/SpotlightPair';
import { BANNERS } from '@/lib/banners';

export default function HomePage() {
  const allProducts = getProducts();
  const featuredProducts = getFeaturedProducts();
  const foodProducts = getProductsByCategory('food');
  const gadgetProducts = getProductsByCategory('gadget');

  return (
    <PageShell>
      <div className="space-y-6">
        <BannerCarousel slides={BANNERS} />

        <section>
          <h2 className="text-xl font-bold text-fg mb-4">あなたへのおすすめ</h2>
          <RecommendedProducts products={allProducts} count={6} />
        </section>

        <SpotlightPair featuredProducts={featuredProducts} foodProducts={foodProducts} gadgetProducts={gadgetProducts} />

        <section className="max-w-2xl mx-auto">
          <Link
            href="/games"
            className="block relative w-full aspect-[4/1] rounded-sm overflow-hidden border border-[color:var(--color-line)] hover:shadow-[0_0_0_1px_var(--color-cta)] transition-shadow"
          >
            <Image src="/banners/banner4.png" alt="ポイントが足りない？ Melmeeで稼ごう" fill className="object-cover" />
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
