import Link from 'next/link';

type Props = {
  value: number;
  reviewCount?: number;
  href?: string;
};

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? '#FFA41C' : '#FFFFFF'}
      stroke={filled ? '#FFA41C' : '#A6A6A6'}
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

export function RatingStars({ value, reviewCount, href }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => i < value);

  return (
    <div className="flex items-center gap-1" data-testid="rating-stars">
      <div className="flex items-center">
        {stars.map((filled, i) => (
          <Star key={i} filled={filled} />
        ))}
      </div>
      {reviewCount !== undefined && reviewCount > 0 && (
        href ? (
          <Link href={href} className="text-xs text-link hover:text-link-hover hover:underline ml-1">
            ({reviewCount})
          </Link>
        ) : (
          <span className="text-xs text-link ml-1">({reviewCount})</span>
        )
      )}
    </div>
  );
}
