export function Footer() {
  return (
    <footer className="border-t border-gold-900 bg-ink-950 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center space-y-3">
        <p className="text-ink-400 text-sm">
          このサイトはジョークです。商品の購入や配送はありません。
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <a
            href="https://x.com/melchamoon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (@melchamoon)"
            className="text-gold-600 hover:text-gold-400"
          >
            X(@melchamoon)
          </a>
          <a
            href="https://github.com/melchamoon/Melzon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-gold-600 hover:text-gold-400"
          >
            GitHub
          </a>
        </div>
        <p className="text-ink-400 text-xs">© 2026 Melzon</p>
      </div>
    </footer>
  );
}
