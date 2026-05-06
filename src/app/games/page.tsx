export const dynamic = 'force-dynamic';

import { getPoints } from '@/lib/cookies';
import { GameCard } from '@/components/games/GameCard';
import { formatPoints } from '@/lib/format';

export default async function GamesPage() {
  const points = await getPoints();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display text-gold-400 mb-2">ミニゲーム</h1>
        <p className="text-2xl font-bold text-gold-500" data-testid="games-balance">
          {formatPoints(points)} pt
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <GameCard
          slug="slot"
          title="めるちゃもスロット"
          description="3 つのリールを回して揃えよう！大当たりで 10,000 pt 獲得。"
          maxPt="10,000"
        />
        <GameCard
          slug="click"
          title="金ネーム連打"
          description="ボタンを連打してポイントを稼ごう！ゲージを維持するのがコツ。"
          maxPt="∞"
        />
        <GameCard
          slug="memory"
          title="金箔めくり"
          description="神経衰弱でペアを揃えよう！ミスが少ないほど高ポイント。"
          maxPt="1,000,000"
        />
      </div>
    </div>
  );
}
