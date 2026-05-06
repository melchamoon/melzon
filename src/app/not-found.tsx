import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <p className="text-6xl">🔍</p>
      <h1 className="text-2xl font-display text-gold-400">ページが見つかりません</h1>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-gold-metal text-ink-950 hover:opacity-90 shadow-gold-glow"
      >
        ストアに戻る
      </Link>
    </div>
  );
}
