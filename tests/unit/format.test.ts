import { describe, it, expect } from 'vitest';
import { formatPoints } from '@/lib/format';

describe('format', () => {
  it('formats 0', () => {
    expect(formatPoints(0)).toBe('0');
  });

  it('formats 1000 with comma', () => {
    expect(formatPoints(1000)).toBe('1,000');
  });

  it('formats large number', () => {
    expect(formatPoints(980000)).toBe('980,000');
  });
});
