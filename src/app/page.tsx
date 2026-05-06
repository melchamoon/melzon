import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { BannerCarousel } from '@/components/layout/BannerCarousel';
import { RecommendedProducts } from '@/components/product/RecommendedProducts';
import { BANNERS } from '@/lib/banners';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <BannerCarousel slides={BANNERS} />

      <section>
        <h2 className="text-xl font-display text-gold-400 mb-4">あなたへのおすすめ</h2>
        <RecommendedProducts products={getProducts()} />
      </section>

      <section className="max-w-2xl mx-auto">
        <Link href="/games" className="block relative w-full aspect-[4/1] rounded-lg overflow-hidden border border-gold-800/50 hover:border-gold-500 transition-colors">
          <Image src="/banners/banner4.png" alt="ポイントが足りない？ ミニゲームで稼ごう" fill className="object-cover" />
        </Link>
      </section>
    </div>
  );
}
