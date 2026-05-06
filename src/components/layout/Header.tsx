'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePoints, useCart } from '@/lib/use-storage';
import { SearchBar } from './SearchBar';
import { HeaderNav } from './HeaderNav';
import { formatPoints } from '@/lib/format';

export function Header() {
  const points = usePoints();
  const cart = useCart();
  const cartCount = cart.items.reduce((s, i) => s + i.qty, 0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40">
      {/* 上段 */}
      <div className="bg-nav text-white">
        <div className="flex items-center gap-2 px-3 h-[60px]">
          {/* ロゴ */}
          <Link href="/" className="shrink-0 px-1 py-1">
            <Image
              src="/logo.png"
              alt="Melzon"
              width={437}
              height={180}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* 配送先（中サイズ以上） */}
          <div className="hidden md:flex flex-col text-xs px-1 py-1 shrink-0">
            <span className="text-white/70 text-[10px]">お届け先</span>
            <span className="font-bold">めるちゃもさん</span>
          </div>

          {/* 検索バー */}
          <div className="flex-1 hidden md:block">
            <SearchBar />
          </div>

          {/* 右側メニュー */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {/* 言語ダミー */}
            <div className="hidden lg:flex items-center gap-1 text-xs px-2 py-1">
              <span>🇯🇵</span>
              <span>JP</span>
            </div>

            {/* ポイント表示 */}
            <span className="hidden sm:block text-xs px-2 py-1">
              {mounted ? (
                <span>{formatPoints(points)} pt</span>
              ) : (
                <span className="invisible">0 pt</span>
              )}
            </span>

            {/* カート */}
            <Link
              href="/cart"
              className="flex items-center gap-1 px-2 py-1"
              aria-label={`カート（${mounted ? cartCount : 0}件）`}
            >
              <span className="text-xl relative">
                🛒
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cta text-nav text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline text-sm font-bold">カート</span>
            </Link>
          </div>
        </div>

        {/* モバイル検索 */}
        <div className="md:hidden px-3 pb-2">
          <SearchBar />
        </div>
      </div>

      {/* 下段ナビ */}
      <HeaderNav />
    </header>
  );
}
