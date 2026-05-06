'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value ?? '';
    router.push('/search?q=' + encodeURIComponent(q));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-10 rounded-[4px] overflow-hidden w-full"
      data-testid="search-form"
    >
      <div
        className="bg-surface text-fg border-r border-[color:var(--color-line-strong)] px-2 text-xs shrink-0 flex items-center"
        aria-label="カテゴリ"
      >
        すべて
      </div>
      <input
        ref={inputRef}
        type="text"
        name="q"
        placeholder="Melzon を検索"
        className="flex-1 px-3 text-fg bg-white outline-none placeholder:text-fg-muted text-sm min-w-0"
        data-testid="search-input"
      />
      <button
        type="submit"
        aria-label="検索"
        className="bg-cta-yellow hover:brightness-95 px-4 flex items-center justify-center shrink-0"
      >
        <Search className="h-5 w-5 text-fg" />
      </button>
    </form>
  );
}
