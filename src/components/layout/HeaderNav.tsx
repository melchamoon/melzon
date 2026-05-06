import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

const NAV_LINKS = [
  { label: 'ホーム', href: '/' },
  { label: 'ポイントを稼ぐ', href: '/games' },
  { label: 'ベストセラー', href: '/bestsellers' },
  ...CATEGORIES.map((c) => ({ label: c.label, href: `/categories/${c.slug}` })),
];

export function HeaderNav() {
  return (
    <nav className="bg-nav-sub text-white h-[39px] flex items-center px-2 overflow-x-auto">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="text-sm px-3 py-1 hover:bg-white/10 shrink-0 whitespace-nowrap"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
