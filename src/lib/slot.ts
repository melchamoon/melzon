import { pickRandom, shuffle } from './recommend';

export type ReelSymbol = '7' | 'CHERRY' | 'BELL' | 'LEMON' | 'GEM' | 'MEL';

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
  // 777: 2%
  if (r < 0.02) return { reels: ['7', '7', '7'], payout: 10_000 };

  // GEM: 3% (r < 0.05)
  if (r < 0.05) return { reels: ['GEM', 'GEM', 'GEM'], payout: 5_000 };

  // MEL: 5% (r < 0.10)
  if (r < 0.10) return { reels: ['MEL', 'MEL', 'MEL'], payout: 2_000 };

  // BELL: 10% (r < 0.20)
  if (r < 0.20) return { reels: ['BELL', 'BELL', 'BELL'], payout: 1_000 };

  // CHERRY or LEMON: 15% (r < 0.35)
  if (r < 0.35) {
    const sym = Math.random() < 0.5 ? 'CHERRY' : 'LEMON';
    return { reels: [sym, sym, sym], payout: 500 };
  }

  // 任意の絵柄2つ: 25% (r < 0.60)
  if (r < 0.60) {
    const dup = pickRandom(ALL_SYMBOLS, 1)[0]!;
    let other: ReelSymbol;
    do {
      other = pickRandom(ALL_SYMBOLS, 1)[0]!;
    } while (other === dup);
    const positions = shuffle([dup, dup, other]) as [ReelSymbol, ReelSymbol, ReelSymbol];
    return { reels: positions, payout: 100 };
  }

  // ハズレ: 40%
  return { reels: randomThreeNoMatch(), payout: 0 };
}

export function calcClickPt(gauge: number): number {
  return Math.floor(1 + 99 * gauge / 100);
}

export function payoutByMisses(misses: number): number {
  const table = [1_000_000, 300_000, 100_000, 30_000, 10_000, 5_000, 2_500, 1_000, 500, 300];
  return table[misses] ?? 100;
}
