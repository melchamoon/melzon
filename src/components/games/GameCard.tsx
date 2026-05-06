import Link from 'next/link';
import Image from 'next/image';

type Props = {
  slug: string;
  title: string;
  description: string;
  image?: string;
};

export function GameCard({ slug, title, description, image }: Props) {
  return (
    <Link
      href={`/games/${slug}`}
      className="block bg-ink-900 border border-gold-800 rounded-xl overflow-hidden hover:border-gold-500 transition-colors"
      data-testid={`game-card-${slug}`}
    >
      {image && (
        <div className="relative w-full aspect-[3/1]">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-display text-gold-400 mb-2">{title}</h2>
        <p className="text-gold-200 text-sm mb-3">{description}</p>
      </div>
    </Link>
  );
}
