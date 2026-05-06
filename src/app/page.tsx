import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { BannerCarousel } from '@/components/layout/BannerCarousel';
import { RecommendedProducts } from '@/components/product/RecommendedProducts';
import { Button } from '@/components/ui/button';
import type { BannerSlide } from '@/types/game';

const BANNERS: BannerSlide[] = [
  { id: 'b1', title: 'めるちゃもさん金ネームおめでとう', href: '/games/click', image: '/banners/banner1.png' },
  { id: 'b2', title: 'めるちゃもスロットで勝ちまくり！モテまくり！', href: '/games/slot', image: '/banners/banner2.png' },
  { id: 'b3', title: '金箔めくりでミリオン獲得！', href: '/games/memory', image: '/banners/banner3.png' },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <BannerCarousel slides={BANNERS} />

      <section>
        <h2 className="text-xl font-display text-gold-400 mb-4">あなたへのおすすめ</h2>
        <RecommendedProducts products={getProducts()} />
      </section>

      <section className="bg-ink-900 border border-gold-800 rounded-xl p-8 text-center">
        <p className="text-gold-300 mb-4 text-lg">ポイントが足りない？ ミニゲームで稼ごう</p>
        <Button asChild size="lg">
          <Link href="/games">ミニゲームへ</Link>
        </Button>
      </section>
    </div>
  );
}
