import { describe, it, expect } from 'vitest';
import { payoutByMisses } from '@/lib/memory';

describe('memory payout', () => {
  const table = [
    [0, 1_000_000],
    [1, 300_000],
    [2, 100_000],
    [3, 50_000],
    [4, 25_000],
    [5, 10_000],
    [6, 5_000],
    [7, 1_000],
    [99, 1_000],
  ] as const;

  for (const [misses, expected] of table) {
    it(`misses=${misses} → ${expected} pt`, () => {
      expect(payoutByMisses(misses)).toBe(expected);
    });
  }
});
