import { pickRandom, shuffle } from './recommend';

export type ReelSymbol = '7' | 'CHERRY' | 'BELL' | 'LEMON' | 'GEM' | 'MEL';

const NON_SEVEN = ['CHERRY', 'BELL', 'LEMON', 'GEM', 'MEL'] as const;
const ALL_SYMBOLS = ['7', 'CHERRY', 'BELL', 'LEMON', 'GEM', 'MEL'] as const;

function randomThreeNoMatch(): [ReelSymbol, ReelSymbol, ReelSymbol] {
  let result: ReelSymbol[];
  do {
    result = pickRandom(ALL_SYMBOLS, 3);
  } while (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]);
  return result as [ReelSymbol, ReelSymbol, ReelSymbol];
}

export function spinResult(): {
  reels: [ReelSymbol, ReelSymbol, ReelSymbol];
  payout: number;
} {
  const r = Math.random();
  if (r < 0.05) {
    return { reels: ['7', '7', '7'], payout: 10_000 };
  }
  if (r < 0.20) {
    const sym = pickRandom(NON_SEVEN, 1)[0]!;
    return { reels: [sym, sym, sym], payout: 1_000 };
  }
  if (r < 0.50) {
    const dup = pickRandom(ALL_SYMBOLS, 1)[0]!;
    let other: ReelSymbol;
    do {
      other = pickRandom(ALL_SYMBOLS, 1)[0]!;
    } while (other === dup);
    const positions = shuffle([dup, dup, other]) as [ReelSymbol, ReelSymbol, ReelSymbol];
    return { reels: positions, payout: 100 };
  }
  return { reels: randomThreeNoMatch(), payout: 0 };
}

export function calcClickPt(gauge: number): number {
  return Math.floor(1 + 99 * gauge / 100);
}

export function payoutByMisses(misses: number): number {
  const table = [1_000_000, 300_000, 100_000, 30_000, 10_000, 5_000, 2_500, 1_000, 500, 300];
  return table[misses] ?? 100;
}
