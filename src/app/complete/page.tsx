export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLastOrder } from '@/lib/cookies';
import { TweetButton } from '@/components/tweet/TweetButton';
import { Button } from '@/components/ui/button';
import { formatPoints } from '@/lib/format';

export default async function CompletePage() {
  const summary = await getLastOrder();
  if (!summary) redirect('/');

  return (
    <div className="max-w-xl mx-auto space-y-8 text-center">
      <div className="space-y-2">
        <p className="text-5xl">🎉</p>
        <h1 className="text-2xl font-display text-gold-400">
          めるちゃもへのプレゼントが完了しました
        </h1>
      </div>

      <div className="bg-ink-900 border border-gold-700 rounded-xl p-6 text-left space-y-3">
        <h2 className="text-gold-400 font-semibold">プレゼント内容</h2>
        {summary.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-gold-200">
            <span>{item.name} ×{item.qty}</span>
            <span>{formatPoints(item.price * item.qty)} pt</span>
          </div>
        ))}
        <div className="border-t border-gold-900 pt-3 flex justify-between font-semibold text-gold-400">
          <span>合計</span>
          <span>{formatPoints(summary.totalPoints)} pt</span>
        </div>
      </div>

      <TweetButton summary={summary} />

      <Button variant="outline-gold" asChild>
        <Link href="/">ストアに戻る</Link>
      </Button>
    </div>
  );
}
