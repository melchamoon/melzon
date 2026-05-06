import { describe, it, expect, vi, afterEach } from 'vitest';
import { spinResult, type ReelSymbol } from '@/lib/slot';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('spinResult', () => {
  it('金7×3揃い (r < 0.0001)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.00005);
    const result = spinResult();
    expect(result.reels).toEqual(['SEVEN_GOLD', 'SEVEN_GOLD', 'SEVEN_GOLD']);
    expect(result.payout).toBe(100_000_000);
  });

  it('青7×3揃い (0.0001 <= r < 0.0011)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.0005);
    const result = spinResult();
    expect(result.reels).toEqual(['SEVEN_BLUE', 'SEVEN_BLUE', 'SEVEN_BLUE']);
    expect(result.payout).toBe(1_000_000);
  });

  it('赤7×3揃い (0.0011 <= r < 0.0111)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.005);
    const result = spinResult();
    expect(result.reels).toEqual(['SEVEN_RED', 'SEVEN_RED', 'SEVEN_RED']);
    expect(result.payout).toBe(10_000);
  });

  it('7-7-BAR ミックス (0.0111 <= r < 0.0211): BARは必ず右リール', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.015);
    const result = spinResult();
    expect(result.payout).toBe(3_000);
    const isSeven = (s: ReelSymbol) => s === 'SEVEN_GOLD' || s === 'SEVEN_BLUE' || s === 'SEVEN_RED';
    expect(isSeven(result.reels[0])).toBe(true);
    expect(result.reels[0]).toBe(result.reels[1]); // 左中は同色
    expect(result.reels[2]).toBe('BAR');
  });

  it('ピエロ×3揃い (0.0211 <= r < 0.0261)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.024);
    const result = spinResult();
    expect(result.reels).toEqual(['PIERROT', 'PIERROT', 'PIERROT']);
    expect(result.payout).toBe(1_000);
  });

  it('チェリー×3揃い (0.0261 <= r < 0.0411)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.03);
    const result = spinResult();
    expect(result.reels).toEqual(['CHERRY', 'CHERRY', 'CHERRY']);
    expect(result.payout).toBe(1_500);
  });

  it('スイカ×3揃い (0.0411 <= r < 0.1411)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.10);
    const result = spinResult();
    expect(result.reels).toEqual(['WATERMELON', 'WATERMELON', 'WATERMELON']);
    expect(result.payout).toBe(800);
  });

  it('ベル×3揃い (0.1411 <= r < 0.3411)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.25);
    const result = spinResult();
    expect(result.reels).toEqual(['BELL', 'BELL', 'BELL']);
    expect(result.payout).toBe(300);
  });

  it('ハズレ (r >= 0.3411)', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.99);
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
      const isSeven = (s: ReelSymbol) => s === 'SEVEN_GOLD' || s === 'SEVEN_BLUE' || s === 'SEVEN_RED';
      if (isSeven(r.reels[0]) && isSeven(r.reels[1]) && r.reels[2] === 'BAR') mixedSevenBar++;
    }
    expect(leftCherry).toBe(0);
    expect(barTriple).toBe(0);
    expect(mixedSevenBar).toBe(0);
  });

  it('全体の確率分布 (10000 trials)', () => {
    const counts = {
      gold: 0,
      blue: 0,
      red: 0,
      bar: 0,
      pierrot: 0,
      cherry: 0,
      watermelon: 0,
      bell: 0,
      miss: 0,
    };
    for (let i = 0; i < 10_000; i++) {
      const r = spinResult();
      if (r.payout === 100_000_000) counts.gold++;
      else if (r.payout === 1_000_000) counts.blue++;
      else if (r.payout === 10_000) counts.red++;
      else if (r.payout === 3_000) counts.bar++;
      else if (r.payout === 1_500) counts.cherry++;
      else if (r.payout === 1_000) counts.pierrot++;
      else if (r.payout === 800) counts.watermelon++;
      else if (r.payout === 300) counts.bell++;
      else counts.miss++;
    }
    // 各カテゴリの統計検証 (寛容な許容範囲)
    expect(counts.bell / 10_000).toBeCloseTo(0.20, 1);
    expect(counts.watermelon / 10_000).toBeCloseTo(0.10, 1);
    expect(counts.cherry / 10_000).toBeCloseTo(0.015, 2);
    expect(counts.miss / 10_000).toBeCloseTo(0.6589, 1);
  });
});
