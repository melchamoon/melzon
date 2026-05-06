'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TweetButton } from '@/components/tweet/TweetButton';
import { Button } from '@/components/ui/button';
import { formatPoints } from '@/lib/format';
import { useLastOrder } from '@/lib/use-storage';

export function CompleteView() {
  const router = useRouter();
  const summary = useLastOrder();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && summary === null) router.replace('/');
  }, [mounted, summary, router]);

  if (!mounted) return null;
  if (summary === null) return null;

  return (
    <div className="bg-white border border-[color:var(--color-line)] max-w-2xl mx-auto p-8 text-center space-y-6">
      <div className="space-y-2">
        <p className="text-5xl">🎉</p>
        <h1 className="text-xl font-bold text-fg">
          めるちゃもへのプレゼントが完了しました
        </h1>
      </div>

      <div className="bg-surface-soft border border-[color:var(--color-line)] p-6 text-left space-y-3">
        <h2 className="text-fg font-bold">プレゼント内容</h2>
        {summary.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-fg">
            <span>{item.name} ×{item.qty}</span>
            <span>{formatPoints(item.price * item.qty)} pt</span>
          </div>
        ))}
        <div className="border-t border-[color:var(--color-line)] pt-3 flex justify-between font-bold text-fg">
          <span>合計</span>
          <span>{formatPoints(summary.totalPoints)} pt</span>
        </div>
      </div>

      <TweetButton summary={summary} />

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" asChild>
          <Link href="/">トップに戻る</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/cart">購入履歴を見る</Link>
        </Button>
      </div>
    </div>
  );
}
