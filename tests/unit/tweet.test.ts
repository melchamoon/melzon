import { describe, it, expect } from 'vitest';
import { buildTweetText, buildTweetUrl } from '@/lib/tweet';
import type { PresentSummary } from '@/types/game';

const SITE = 'https://melzon.vercel.app';

describe('tweet', () => {
  it('includes hashtag', () => {
    const s: PresentSummary = {
      items: [{ id: 'p_001', name: '金鮭', qty: 1, price: 100 }],
      totalPoints: 100,
    };
    expect(buildTweetText(s, SITE)).toContain('#めるちゃもさん金ネームおめでとう');
  });

  it('includes formatted total', () => {
    const s: PresentSummary = {
      items: [{ id: 'p_001', name: '金鮭', qty: 1, price: 12800 }],
      totalPoints: 12800,
    };
    expect(buildTweetText(s, SITE)).toContain('12,800');
  });

  it('is under 280-23-1 chars', () => {
    const s: PresentSummary = {
      items: [{ id: 'p_001', name: 'とても長い商品名を持つ商品でポイントがたくさん必要なもの', qty: 5, price: 999999 }],
      totalPoints: 4999995,
    };
    const text = buildTweetText(s, SITE);
    expect(text.length).toBeLessThanOrEqual(280 - 24);
  });

  it('shows max 3 items then hidden count', () => {
    const s: PresentSummary = {
      items: [
        { id: 'p_001', name: 'A', qty: 2, price: 500 },
        { id: 'p_002', name: 'B', qty: 1, price: 100 },
        { id: 'p_003', name: 'C', qty: 1, price: 200 },
        { id: 'p_004', name: 'D', qty: 1, price: 300 },
      ],
      totalPoints: 2000,
    };
    const text = buildTweetText(s, SITE);
    expect(text).toContain('ほか');
  });

  it('generates valid twitter intent URL', () => {
    const s: PresentSummary = {
      items: [{ id: 'p_001', name: '金鮭', qty: 1, price: 100 }],
      totalPoints: 100,
    };
    const url = buildTweetUrl(s, SITE);
    expect(url).toContain('twitter.com/intent/tweet');
    expect(url).toContain('text=');
    expect(url).toContain('url=');
  });
});
