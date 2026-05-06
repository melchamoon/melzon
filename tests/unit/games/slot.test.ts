import { describe, it, expect, vi, afterEach } from 'vitest';
import { spinResult, HANDS, type ReelSymbol } from '@/lib/slot';

afterEach(() => {
  vi.restoreAllMocks();
});

const isSeven = (s: ReelSymbol) => s === 'SEVEN_GOLD' || s === 'SEVEN_BLUE' || s === 'SEVEN_RED';

// HANDS の累積確率からミッドポイントを計算
const boundaries = (() => {
  let cum = 0;
  return HANDS.map(h => {
    const start = cum;
    cum += h.prob;
    return { id: h.id, hand: h, mid: start + h.prob / 2 };
  });
})();
const totalProb = HANDS.reduce((s, h) => s + h.prob, 0);


describe('spinResult', () => {
  it('金7×3揃い', () => {
    const b = boundaries.find(b => b.id === 'SEVEN_GOLD_3')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.reels).toEqual(b.hand.reels);
    expect(result.payout).toBe(b.hand.payout);
  });

  it('青7×3揃い', () => {
    const b = boundaries.find(b => b.id === 'SEVEN_BLUE_3')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.reels).toEqual(b.hand.reels);
    expect(result.payout).toBe(b.hand.payout);
  });

  it('赤7×3揃い', () => {
    const b = boundaries.find(b => b.id === 'SEVEN_RED_3')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.reels).toEqual(b.hand.reels);
    expect(result.payout).toBe(b.hand.payout);
  });

  it('7-7-BAR ミックス: BARは必ず右リール', () => {
    const b = boundaries.find(b => b.id === 'SEVEN_BAR_MIX')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.payout).toBe(b.hand.payout);
    expect(isSeven(result.reels[0])).toBe(true);
    expect(result.reels[0]).toBe(result.reels[1]);
    expect(result.reels[2]).toBe('BAR');
  });

  it('ピエロ×3揃い', () => {
    const b = boundaries.find(b => b.id === 'PIERROT_3')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.reels).toEqual(b.hand.reels);
    expect(result.payout).toBe(b.hand.payout);
  });

  it('チェリー×3揃い', () => {
    const b = boundaries.find(b => b.id === 'CHERRY_3')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.reels).toEqual(b.hand.reels);
    expect(result.payout).toBe(b.hand.payout);
  });

  it('スイカ×3揃い', () => {
    const b = boundaries.find(b => b.id === 'WATERMELON_3')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.reels).toEqual(b.hand.reels);
    expect(result.payout).toBe(b.hand.payout);
  });

  it('ベル×3揃い', () => {
    const b = boundaries.find(b => b.id === 'BELL_3')!;
    vi.spyOn(Math, 'random').mockReturnValueOnce(b.mid);
    const result = spinResult();
    expect(result.reels).toEqual(b.hand.reels);
    expect(result.payout).toBe(b.hand.payout);
  });

  it('ハズレ', () => {
    const missR = (totalProb + 1) / 2;
    vi.spyOn(Math, 'random').mockReturnValueOnce(missR);
    const result = spinResult();
    expect(result.payout).toBe(0);
  });

  it('ハズレ時: 約20%で左=中の揃いかけが発生し、7の2列揃いは出ない', () => {
    let nearMiss = 0;
    let sevenPair = 0;
    let total = 0;
    for (let i = 0; i < 10_000; i++) {
      const r = spinResult();
      if (r.payout !== 0) continue;
      total++;
      if (r.reels[0] === r.reels[1]) nearMiss++;
      const isLeft7 = r.reels[0] === 'SEVEN_GOLD' || r.reels[0] === 'SEVEN_BLUE' || r.reels[0] === 'SEVEN_RED';
      const isMid7 = r.reels[1] === 'SEVEN_GOLD' || r.reels[1] === 'SEVEN_BLUE' || r.reels[1] === 'SEVEN_RED';
      if (isLeft7 && isMid7) sevenPair++;
    }
    expect(nearMiss / total).toBeCloseTo(0.20, 1);
    expect(sevenPair).toBe(0);
  });

  it('ハズレ時: BAR×3 は出ない / 左リールにチェリーは出ない / 7-7-BAR にもならない', () => {
    let leftCherry = 0;
    let barTriple = 0;
    let mixedSevenBar = 0;
    for (let i = 0; i < 10_000; i++) {
      const r = spinResult();
      if (r.payout !== 0) continue;
      if (r.reels[0] === 'CHERRY') leftCherry++;
      if (r.reels[0] === 'BAR' && r.reels[1] === 'BAR' && r.reels[2] === 'BAR') barTriple++;
      if (isSeven(r.reels[0]) && isSeven(r.reels[1]) && r.reels[2] === 'BAR') mixedSevenBar++;
    }
    expect(leftCherry).toBe(0);
    expect(barTriple).toBe(0);
    expect(mixedSevenBar).toBe(0);
  });

  it('全体の確率分布 (10000 trials)', () => {
    const TRIALS = 10_000;
    const hitCounts = new Map<string, number>(HANDS.map(h => [h.id, 0]));
    let misses = 0;

    for (let i = 0; i < TRIALS; i++) {
      const r = spinResult();
      if (r.payout === 0) { misses++; continue; }
      const hand = HANDS.find(h => h.payout === r.payout);
      if (hand) hitCounts.set(hand.id, (hitCounts.get(hand.id) ?? 0) + 1);
    }

    const missProb = 1 - totalProb;
    expect(misses / TRIALS).toBeCloseTo(missProb, 1);

    for (const hand of HANDS.filter(h => h.prob >= 0.05)) {
      expect(hitCounts.get(hand.id)! / TRIALS).toBeCloseTo(hand.prob, 1);
    }
  });
});
