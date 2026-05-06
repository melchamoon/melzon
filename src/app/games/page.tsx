import { GameCard } from '@/components/games/GameCard';

export default function GamesPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display text-gold-400">ミニゲーム</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <GameCard
          slug="click"
          title="金ネーム連打"
          description="ボタンを連打してポイントを稼ごう！ゲージを維持するのがコツ。"
        />
        <GameCard
          slug="slot"
          title="めるちゃもスロット"
          description="3 つのリールを回して揃えよう！大当たりで 10,000 pt 獲得。"
        />
        <GameCard
          slug="memory"
          title="金箔めくり"
          description="神経衰弱でペアを揃えよう！ミスが少ないほど高ポイント。"
        />
      </div>
    </div>
  );
}
