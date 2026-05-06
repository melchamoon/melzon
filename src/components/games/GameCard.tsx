import Link from 'next/link';

type Props = {
  slug: string;
  title: string;
  description: string;
  maxPt: string;
};

export function GameCard({ slug, title, description, maxPt }: Props) {
  return (
    <Link
      href={`/games/${slug}`}
      className="block bg-ink-900 border border-gold-800 rounded-xl p-6 hover:border-gold-500 transition-colors"
      data-testid={`game-card-${slug}`}
    >
      <h2 className="text-xl font-display text-gold-400 mb-2">{title}</h2>
      <p className="text-gold-200 text-sm mb-3">{description}</p>
      <p className="text-gold-500 text-xs font-semibold">最高 {maxPt} pt</p>
    </Link>
  );
}
