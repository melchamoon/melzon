export type ReelSymbol =
  | 'SEVEN_GOLD'
  | 'SEVEN_BLUE'
  | 'SEVEN_RED'
  | 'BAR'
  | 'PIERROT'
  | 'CHERRY'
  | 'WATERMELON'
  | 'BELL';

export const ALL_SYMBOLS: readonly ReelSymbol[] = [
  'SEVEN_GOLD',
  'SEVEN_BLUE',
  'SEVEN_RED',
  'BAR',
  'PIERROT',
  'CHERRY',
  'WATERMELON',
  'BELL',
] as const;

const SEVEN_COLORS: readonly ReelSymbol[] = ['SEVEN_GOLD', 'SEVEN_BLUE', 'SEVEN_RED'];

// 左リールにCHERRYは出ない + 7は揃いかけ不可（7×2=ハズレにできないため）
const NEAR_MISS_POOL: readonly ReelSymbol[] = ['BAR', 'PIERROT', 'WATERMELON', 'BELL'];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function isSeven(s: ReelSymbol): boolean {
  return s === 'SEVEN_GOLD' || s === 'SEVEN_BLUE' || s === 'SEVEN_RED';
}

function generateMixedSevenBar(): [ReelSymbol, ReelSymbol, ReelSymbol] {
  const seven = pickRandom(SEVEN_COLORS);
  return [seven, seven, 'BAR'];
}

// ハズレ時のリール: 役と被らないこと、左リールにチェリーを出さないこと、BAR×3 にならないこと
function randomLoss(): [ReelSymbol, ReelSymbol, ReelSymbol] {
  const leftPool = ALL_SYMBOLS.filter((s) => s !== 'CHERRY');

  // 20%の確率で揃いかけ（左=中、右は違う絵柄）。7は使わない
  if (Math.random() < 0.20) {
    const sym = pickRandom(NEAR_MISS_POOL);
    const rightPool = ALL_SYMBOLS.filter((s) => s !== sym);
    return [sym, sym, pickRandom(rightPool)];
  }

  // 通常ハズレ（左=中の揃いかけにならない）
  while (true) {
    const a = pickRandom(leftPool);
    const b = pickRandom(ALL_SYMBOLS);
    const c = pickRandom(ALL_SYMBOLS);
    if (a === b) continue; // 揃いかけは上のブランチで処理（3つ揃いも含め排除）
    if (isSeven(a) && isSeven(b)) continue; // 左中7×2は7-7-BAR役と重複
    return [a, b, c];
  }
}

export function spinResult(): {
  reels: [ReelSymbol, ReelSymbol, ReelSymbol];
  payout: number;
} {
  const r = Math.random();

  // 金7×3: 0.01%
  if (r < 0.0001) return { reels: ['SEVEN_GOLD', 'SEVEN_GOLD', 'SEVEN_GOLD'], payout: 100_000_000 };
  // 青7×3: 0.1%
  if (r < 0.0011) return { reels: ['SEVEN_BLUE', 'SEVEN_BLUE', 'SEVEN_BLUE'], payout: 1_000_000 };
  // 赤7×3: 1%
  if (r < 0.0111) return { reels: ['SEVEN_RED', 'SEVEN_RED', 'SEVEN_RED'], payout: 10_000 };
  // 7-7-BAR ミックス: 1%
  if (r < 0.0211) return { reels: generateMixedSevenBar(), payout: 3_000 };
  // ピエロ×3: 0.5%
  if (r < 0.0261) return { reels: ['PIERROT', 'PIERROT', 'PIERROT'], payout: 1_000 };
  // チェリー×3: 1.5%
  if (r < 0.0411) return { reels: ['CHERRY', 'CHERRY', 'CHERRY'], payout: 1_500 };
  // スイカ×3: 10%
  if (r < 0.1411) return { reels: ['WATERMELON', 'WATERMELON', 'WATERMELON'], payout: 800 };
  // ベル×3: 20%
  if (r < 0.3411) return { reels: ['BELL', 'BELL', 'BELL'], payout: 300 };
  // ハズレ
  return { reels: randomLoss(), payout: 0 };
}

export function calcClickPt(gauge: number): number {
  return Math.floor(1 + (99 * gauge) / 100);
}

export function payoutByMisses(misses: number): number {
  const table = [100_000_000, 1_000_000, 515_000, 265_000, 135_000, 70_000, 35_000];
  return table[misses] ?? 1_000;
}
