import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <form action="/search" method="get" className="flex w-full max-w-xl">
      <input
        type="text"
        name="q"
        placeholder="商品を検索（しても無駄）"
        className="flex-1 rounded-l-md bg-ink-900 border border-gold-700 px-3 py-2 text-gold-200 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-gold-500 text-sm"
      />
      <button
        type="submit"
        aria-label="検索"
        className="bg-gold-metal rounded-r-md px-3 hover:opacity-90"
      >
        <Search className="h-4 w-4 text-ink-950" />
      </button>
    </form>
  );
}
