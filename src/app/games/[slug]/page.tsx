import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import { pickRandom } from '@/lib/recommend';
import { Slot } from '@/components/games/Slot';
import { Click } from '@/components/games/Click';
import { Memory } from '@/components/games/Memory';

const GAME_TITLES: Record<string, string> = {
  slot: 'めるちゃもスロット',
  click: 'めるちゃもを褒める',
  memory: '賭博神経衰弱めるちゃも',
};

const GAME_BANNERS: Record<string, string> = {
  click: '/banners/banner1.png',
  slot: '/banners/banner2.png',
  memory: '/banners/banner3.png',
};

type Props = { params: Promise<{ slug: string }> };

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  if (!['slot', 'click', 'memory'].includes(slug)) notFound();

  const title = GAME_TITLES[slug]!;
  const banner = GAME_BANNERS[slug];

  return (
    <div className="space-y-6">
      {banner && (
        <div className="relative w-full max-w-lg mx-auto aspect-[3/1] rounded-sm overflow-hidden border border-[color:var(--color-line)]">
          <Image src={banner} alt={title} fill className="object-cover" priority />
        </div>
      )}

      {slug === 'slot' && <Slot />}
      {slug === 'click' && <Click />}
      {slug === 'memory' && (
        <Memory products={pickRandom(getProducts(), 6)} />
      )}
    </div>
  );
}
