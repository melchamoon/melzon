import { describe, it, expect } from 'vitest';
import { calcClickPt } from '@/lib/slot';
import { clampEarn } from '@/lib/points';

describe('click game', () => {
  it('returns 1 pt at gauge 0', () => {
    expect(calcClickPt(0)).toBe(1);
  });

  it('returns 100 pt at gauge 100', () => {
    expect(calcClickPt(100)).toBe(100);
  });

  it('returns intermediate value', () => {
    expect(calcClickPt(50)).toBe(50); // 1 + 99 * 50 / 100 = 50.5 → floor = 50
  });

  it('clampEarn limits to 1_100_000', () => {
    expect(clampEarn(2_000_000)).toBe(1_100_000);
  });

  it('clampEarn allows 0', () => {
    expect(clampEarn(0)).toBe(0);
  });

  it('clampEarn rejects negative', () => {
    expect(clampEarn(-100)).toBe(0);
  });
});
