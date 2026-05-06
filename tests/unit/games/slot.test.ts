import { describe, it, expect, vi } from 'vitest';
import { spinResult } from '@/lib/slot';

describe('slot', () => {
  it('returns 777 when random < 0.05', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.01);
    const result = spinResult();
    expect(result.reels).toEqual(['7', '7', '7']);
    expect(result.payout).toBe(10_000);
    vi.restoreAllMocks();
  });

  it('returns 3-of-a-kind non-7 when random in [0.05, 0.20)', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.10) // triggers branch
      .mockReturnValue(0.0); // pickRandom picks index 0 = CHERRY
    const result = spinResult();
    expect(result.payout).toBe(1_000);
    expect(result.reels[0]).toBe(result.reels[1]);
    expect(result.reels[1]).toBe(result.reels[2]);
    vi.restoreAllMocks();
  });

  it('returns 0 payout when random >= 0.50', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = spinResult();
    expect(result.payout).toBe(0);
    vi.restoreAllMocks();
  });

  it('probability distribution over 10000 trials', () => {
    vi.restoreAllMocks();
    let jackpot = 0, threeOfAKind = 0, twoOfAKind = 0, miss = 0;
    for (let i = 0; i < 10000; i++) {
      const r = spinResult();
      if (r.payout === 10_000) jackpot++;
      else if (r.payout === 1_000) threeOfAKind++;
      else if (r.payout === 100) twoOfAKind++;
      else miss++;
    }
    expect(jackpot / 10000).toBeCloseTo(0.05, 1);
    expect(threeOfAKind / 10000).toBeCloseTo(0.15, 1);
    expect(twoOfAKind / 10000).toBeCloseTo(0.30, 1);
    expect(miss / 10000).toBeCloseTo(0.50, 1);
  });
});
