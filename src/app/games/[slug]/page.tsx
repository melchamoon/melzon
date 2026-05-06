'use client';
import { useParams } from 'next/navigation';
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

export default function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  if (!['slot', 'click', 'memory'].includes(slug)) notFound();

  const title = GAME_TITLES[slug]!;
  const banner = GAME_BANNERS[slug];
  const isSlot = slug === 'slot';

  if (isSlot) {
    return (
      <div className="relative -mt-4 -mb-8">
        <div
          aria-hidden
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-950"
        />
        <div className="relative space-y-6 py-8 md:py-12">
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
    <div className="space-y-6">
      {banner && (
        <div className="relative w-full max-w-lg mx-auto aspect-[3/1] rounded-sm overflow-hidden border border-[color:var(--color-line)]">
          <Image src={banner} alt={title} fill className="object-cover pointer-events-none" priority />
        </div>
      )}

      {slug === 'click' && <Click />}
      {slug === 'memory' && (
        <Memory products={pickRandom(getProducts(), 6)} />
      )}
    </div>
  );
}
