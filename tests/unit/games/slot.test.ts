import { describe, it, expect, vi } from 'vitest';
import { spinResult } from '@/lib/slot';

describe('slot', () => {
  it('returns 777 when random < 0.02', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.01);
    const result = spinResult();
    expect(result.reels).toEqual(['7', '7', '7']);
    expect(result.payout).toBe(10_000);
    vi.restoreAllMocks();
  });

  it('returns GEM 3-of-a-kind when random in [0.02, 0.05)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.03);
    const result = spinResult();
    expect(result.payout).toBe(5_000);
    expect(result.reels).toEqual(['GEM', 'GEM', 'GEM']);
    vi.restoreAllMocks();
  });

  it('returns 0 payout when random >= 0.60', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const result = spinResult();
    expect(result.payout).toBe(0);
    vi.restoreAllMocks();
  });

  it('probability distribution over 10000 trials', () => {
    vi.restoreAllMocks();
    let jackpot = 0,
      gem = 0,
      mel = 0,
      bell = 0,
      cherryLemon = 0,
      twoOfAKind = 0,
      miss = 0;
      
    for (let i = 0; i < 10000; i++) {
      const r = spinResult();
      if (r.payout === 10_000) jackpot++;
      else if (r.payout === 5_000) gem++;
      else if (r.payout === 2_000) mel++;
      else if (r.payout === 1_000) bell++;
      else if (r.payout === 500) cherryLemon++;
      else if (r.payout === 100) twoOfAKind++;
      else miss++;
    }
    
    expect(jackpot / 10000).toBeCloseTo(0.02, 1);
    expect(gem / 10000).toBeCloseTo(0.03, 1);
    expect(mel / 10000).toBeCloseTo(0.05, 1);
    expect(bell / 10000).toBeCloseTo(0.10, 1);
    expect(cherryLemon / 10000).toBeCloseTo(0.15, 1);
    expect(twoOfAKind / 10000).toBeCloseTo(0.25, 1);
    expect(miss / 10000).toBeCloseTo(0.40, 1);
  });
});
