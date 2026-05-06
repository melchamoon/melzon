import { describe, it, expect } from 'vitest';
import { shuffle, pickRandom } from '@/lib/recommend';

describe('recommend', () => {
  it('shuffle preserves length and elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
    expect(result.sort()).toEqual([...arr].sort());
  });

  it('pickRandom returns n items', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    expect(pickRandom(arr, 5)).toHaveLength(5);
    expect(pickRandom(arr, 12)).toHaveLength(12);
  });

  it('pickRandom with n >= arr.length returns all', () => {
    const arr = [1, 2, 3];
    expect(pickRandom(arr, 10)).toHaveLength(3);
  });
});
