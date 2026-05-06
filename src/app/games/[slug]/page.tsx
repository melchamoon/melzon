import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/products';
import { pickRandom } from '@/lib/recommend';
import { Slot } from '@/components/games/Slot';
import { Click } from '@/components/games/Click';
import { Memory } from '@/components/games/Memory';

const GAME_TITLES: Record<string, string> = {
  slot: 'めるちゃもスロット',
  click: '金ネーム連打',
  memory: '金箔めくり（神経衰弱）',
};

type Props = { params: Promise<{ slug: string }> };

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  if (!['slot', 'click', 'memory'].includes(slug)) notFound();

  const title = GAME_TITLES[slug]!;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display text-gold-400 text-center">{title}</h1>

      {slug === 'slot' && <Slot />}
      {slug === 'click' && <Click />}
      {slug === 'memory' && (
        <Memory products={pickRandom(getProducts(), 6)} />
      )}
    </div>
  );
}
