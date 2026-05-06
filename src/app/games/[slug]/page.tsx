'use client';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProducts } from '@/lib/products';
import { pickRandom } from '@/lib/recommend';
import { Slot } from '@/components/games/Slot';
import { Click } from '@/components/games/Click';
import { Memory } from '@/components/games/Memory';
import { PageShell } from '@/components/layout/PageShell';

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

export default function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  if (!['slot', 'click', 'memory'].includes(slug)) notFound();

  const title = GAME_TITLES[slug]!;
  const banner = GAME_BANNERS[slug];

  if (slug === 'slot') {
    return (
      <div className="flex-1 bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
        <div className="max-w-[1500px] mx-auto px-2 md:px-4 py-8 md:py-12 space-y-6">
          {banner && (
            <div className="relative w-full max-w-lg mx-auto aspect-[3/1] rounded-sm overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-500/10">
              <Image src={banner} alt={title} fill className="object-cover pointer-events-none" priority />
            </div>
          )}
          <Slot />
        </div>
      </div>
    );
  }

  return (
    <PageShell variant={slug === 'memory' ? 'kaiji' : slug === 'click' ? 'click' : 'default'}>
      <div className="space-y-6">
        {banner && (
          <div className={`relative w-full max-w-lg mx-auto aspect-[3/1] rounded-sm overflow-hidden border ${
            slug === 'memory' ? 'border-red-900/60 shadow-lg shadow-red-950/40' : 'border-[color:var(--color-line)]'
          }`}>
            <Image src={banner} alt={title} fill className="object-cover pointer-events-none" priority />
          </div>
        )}

        {slug === 'click' && <Click />}
        {slug === 'memory' && (
          <Memory products={pickRandom(getProducts(), 6)} />
        )}
      </div>
    </PageShell>
  );
}
