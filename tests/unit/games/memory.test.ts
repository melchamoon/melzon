import { describe, it, expect } from 'vitest';
import { payoutByMisses } from '@/lib/memory';

describe('memory payout', () => {
  const table = [
    [0, 100_000_000],
    [1, 1_000_000],
    [2, 500_000],
    [3, 250_000],
    [4, 150_000],
    [5, 50_000],
    [6, 10_000],
    [7, 1_000],
    [99, 1_000],
  ] as const;

  for (const [misses, expected] of table) {
    it(`misses=${misses} → ${expected} pt`, () => {
      expect(payoutByMisses(misses)).toBe(expected);
    });
  }
});
