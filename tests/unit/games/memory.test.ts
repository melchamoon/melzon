import { describe, it, expect } from 'vitest';
import { payoutByMisses } from '@/lib/slot';

describe('memory payout', () => {
  const table = [
    [0, 1_000_000],
    [1, 300_000],
    [2, 100_000],
    [3, 30_000],
    [4, 10_000],
    [5, 5_000],
    [6, 2_500],
    [7, 1_000],
    [8, 500],
    [9, 300],
    [10, 100],
    [99, 100],
  ] as const;

  for (const [misses, expected] of table) {
    it(`misses=${misses} → ${expected} pt`, () => {
      expect(payoutByMisses(misses)).toBe(expected);
    });
  }
});
