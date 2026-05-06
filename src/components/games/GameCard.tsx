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
      data-testid={`game-card-${slug}`}
      className="block bg-white border border-[color:var(--color-line)] rounded-sm overflow-hidden hover:shadow-[0_0_0_1px_var(--color-cta)] transition-shadow"
    >
      {image && (
        <div className="relative w-full aspect-[3/1] bg-white">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-base font-bold text-fg mb-1">{title}</h2>
        <p className="text-fg-muted text-sm">{description}</p>
      </div>
    </Link>
  );
}
