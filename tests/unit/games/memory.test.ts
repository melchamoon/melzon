import { describe, it, expect } from 'vitest';
import { payoutByMisses } from '@/lib/memory';

describe('memory payout', () => {
  it('misses=0 が最高報酬', () => {
    expect(payoutByMisses(0)).toBeGreaterThan(payoutByMisses(1));
  });

  it('ミス増加で報酬は単調減少する', () => {
    for (let i = 0; i < 6; i++) {
      expect(payoutByMisses(i)).toBeGreaterThan(payoutByMisses(i + 1));
    }
  });

  it('テーブル外のミス数は一定のフロア値を返す', () => {
    const floor = payoutByMisses(99);
    expect(floor).toBeGreaterThan(0);
    expect(payoutByMisses(50)).toBe(floor);
    expect(payoutByMisses(100)).toBe(floor);
  });

});
