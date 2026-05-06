import Link from 'next/link';
import { getPoints } from '@/lib/cookies';
import { getCart } from '@/lib/cookies';
import { SearchBar } from './SearchBar';
import { formatPoints } from '@/lib/format';

export async function Header() {
  const [points, cart] = await Promise.all([getPoints(), getCart()]);
  const cartCount = cart.items.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="bg-ink-950 border-b border-gold-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-2">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-display text-gold-500 drop-shadow shrink-0"
          >
            Melzon
          </Link>

          <div className="flex-1 hidden md:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <span className="hidden sm:block text-gold-300 text-sm">
              {formatPoints(points)} pt
            </span>

            <Link
              href="/games"
              className="text-gold-400 hover:text-gold-300 text-sm"
              aria-label="ミニゲーム"
            >
              🎮
              <span className="hidden md:inline ml-1">ミニゲーム</span>
            </Link>

            <Link
              href="/cart"
              className="relative text-gold-400 hover:text-gold-300"
              aria-label={`カート（${cartCount}件）`}
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ruby text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="md:hidden pb-2">
          <SearchBar />
        </div>

        <div className="hidden md:block border-t border-gold-900 py-1 text-xs text-gold-600 text-center">
          めるちゃもへの贈り物専門ストア
        </div>
      </div>
    </header>
  );
}
