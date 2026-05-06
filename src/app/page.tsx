export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { pickRandom } from '@/lib/recommend';
import { BannerCarousel } from '@/components/layout/BannerCarousel';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import type { BannerSlide } from '@/types/game';

const BANNERS: BannerSlide[] = [
  { id: 'b1', title: 'めるちゃもさん金ネームおめでとう' },
  { id: 'b2', title: 'めるちゃもスロットで一攫千金！', href: '/games/slot' },
  { id: 'b3', title: '金ネーム連打でポイント爆稼ぎ！', href: '/games/click' },
  { id: 'b4', title: '金箔めくりでミリオン獲得！', href: '/games/memory' },
];

export default function HomePage() {
  const products = pickRandom(getProducts(), 12);

  return (
    <div className="space-y-12">
      <BannerCarousel slides={BANNERS} />

      <section>
        <h2 className="text-xl font-display text-gold-400 mb-4">あなたへのおすすめ</h2>
        <ProductGrid products={products} />
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
