import type { PresentSummary } from '@/types/game';

const HASHTAG = '#めるちゃもさん金ネームおめでとう';
const TWEET_URL = 'https://twitter.com/intent/tweet';
const URL_LENGTH = 23;

export function buildTweetText(summary: PresentSummary, siteUrl: string): string {
  void siteUrl;
  const total = summary.totalPoints.toLocaleString('ja-JP');
  const sortedNames = [...summary.items]
    .sort((a, b) => b.price - a.price)
    .flatMap((i) => Array<string>(i.qty).fill(i.name));

  const formatBody = (visible: string[], hiddenCount: number) => {
    const parts = visible.map((n) => `「${n}」`).join('');
    const tail = hiddenCount > 0 ? `ほか${hiddenCount}点` : '';
    return [
      `めるちゃもさんに${parts}${tail}をプレゼントしたよ。`,
      `合計${total}ポイントのお買い上げです。`,
      HASHTAG,
    ].join('\n');
  };

  const visibleCount = sortedNames.length <= 3 ? sortedNames.length : 3;
  let visible = sortedNames.slice(0, visibleCount);
  let hidden = sortedNames.length - visible.length;

  const limit = 280 - (URL_LENGTH + 1);
  while (formatBody(visible, hidden).length > limit && visible.length > 1) {
    visible = visible.slice(0, visible.length - 1);
    hidden = sortedNames.length - visible.length;
  }
  return formatBody(visible, hidden);
}

export function buildTweetUrl(summary: PresentSummary, siteUrl: string): string {
  const text = buildTweetText(summary, siteUrl);
  const params = new URLSearchParams({ text, url: siteUrl });
  return `${TWEET_URL}?${params.toString()}`;
}
