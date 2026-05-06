import { GameCard } from '@/components/games/GameCard';

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-fg">ポイントを稼ぐ</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GameCard
          slug="click"
          title="めるちゃもを褒める"
          description="ボタンを連打してポイントを稼ごう！ゲージを維持するのがコツ。"
          image="/banners/banner1.png"
        />
        <GameCard
          slug="slot"
          title="めるちゃもスロット"
          description="3 つのリールを回して揃えよう！大当たりで 10,000 pt 獲得。"
          image="/banners/banner2.png"
        />
        <GameCard
          slug="memory"
          title="賭博神経衰弱めるちゃも"
          description="神経衰弱でペアを揃えよう！ミスが少ないほど高ポイント。"
          image="/banners/banner3.png"
        />
      </div>
    </div>
  );
}
