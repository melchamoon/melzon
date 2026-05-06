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

export const SYMBOL_LABEL: Record<ReelSymbol, string> = {
  SEVEN_GOLD: '金7',
  SEVEN_BLUE: '青7',
  SEVEN_RED: '赤7',
  BAR: 'BAR',
  PIERROT: 'ピエロ',
  CHERRY: 'チェリー',
  WATERMELON: 'スイカ',
  BELL: 'ベル',
};

export type HandId =
  | 'SEVEN_GOLD_3'
  | 'SEVEN_BLUE_3'
  | 'SEVEN_RED_3'
  | 'SEVEN_BAR_MIX'
  | 'PIERROT_3'
  | 'CHERRY_3'
  | 'WATERMELON_3'
  | 'BELL_3';

export type HandConfig = {
  readonly id: HandId;
  readonly label: string;
  readonly prob: number;
  readonly payout: number;
  /** null = 動的生成（ミックス役など） */
  readonly reels: [ReelSymbol, ReelSymbol, ReelSymbol] | null;
  /** reels が null の役のペイテーブル表示用リール */
  readonly displayReels?: [ReelSymbol, ReelSymbol, ReelSymbol];
  readonly highlight?: 'gold' | 'blue' | 'red';
  readonly note?: string;
};

export const HANDS: readonly HandConfig[] = [
  { id: 'SEVEN_GOLD_3',  label: '金セブン×3', prob: 0.001, payout: 1_000_000, reels: ['SEVEN_GOLD', 'SEVEN_GOLD', 'SEVEN_GOLD'], highlight: 'gold' },
  { id: 'SEVEN_BLUE_3',  label: '青セブン×3', prob: 0.002, payout: 500_000,  reels: ['SEVEN_BLUE', 'SEVEN_BLUE', 'SEVEN_BLUE'], highlight: 'blue' },
  { id: 'SEVEN_RED_3',   label: '赤セブン×3', prob: 0.012, payout: 100_000,   reels: ['SEVEN_RED',  'SEVEN_RED',  'SEVEN_RED' ], highlight: 'red'  },
  { id: 'SEVEN_BAR_MIX', label: 'セブン-BAR', prob: 0.015, payout: 10_000,       reels: null, displayReels: ['SEVEN_RED', 'SEVEN_RED', 'BAR'], note: '7-7-BAR' },
  { id: 'PIERROT_3',     label: 'ピエロ×3',   prob: 0.0001, payout: 5_000,       reels: ['PIERROT',    'PIERROT',    'PIERROT'   ] },
  { id: 'CHERRY_3',      label: 'チェリー×3', prob: 0.030, payout: 2_500,       reels: ['CHERRY',     'CHERRY',     'CHERRY'    ] },
  { id: 'WATERMELON_3',  label: 'スイカ×3',   prob: 0.10,  payout: 2000,         reels: ['WATERMELON', 'WATERMELON', 'WATERMELON'] },
  { id: 'BELL_3',        label: 'ベル×3',     prob: 0.25,  payout: 500,         reels: ['BELL',       'BELL',       'BELL'      ] },
];

export type PayTableEntry = HandConfig & {
  readonly ev: number;       // prob × payout（1スピンあたりの期待値寄与）
  readonly hitRate: number;  // 1/prob の整数（例: 0.002 → 500）
};

export const PAY_TABLE: readonly PayTableEntry[] = HANDS.map((h) => ({
  ...h,
  ev: h.prob * h.payout,
  hitRate: Math.round(1 / h.prob),
}));

/** 1スピンあたりの期待ペイアウト合計 */
export const EXPECTED_PAYOUT: number = PAY_TABLE.reduce((sum, row) => sum + row.ev, 0);

// 左リールにCHERRYは出ない + 7は揃いかけ不可（7×2=ハズレにできないため）
const NEAR_MISS_POOL: readonly ReelSymbol[] = ['BAR', 'PIERROT', 'WATERMELON', 'BELL'];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function isSeven(s: ReelSymbol): boolean {
  return s === 'SEVEN_GOLD' || s === 'SEVEN_BLUE' || s === 'SEVEN_RED';
}

const SEVEN_HAND_WEIGHTS = HANDS
  .filter((h): h is HandConfig & { reels: [ReelSymbol, ReelSymbol, ReelSymbol] } =>
    h.reels !== null && isSeven(h.reels[0]) && h.reels[0] === h.reels[1] && h.reels[1] === h.reels[2]
  )
  .map((h) => ({ symbol: h.reels[0], prob: h.prob }));

const SEVEN_TOTAL_PROB = SEVEN_HAND_WEIGHTS.reduce((s, w) => s + w.prob, 0);

function generateMixedSevenBar(): [ReelSymbol, ReelSymbol, ReelSymbol] {
  const r = Math.random() * SEVEN_TOTAL_PROB;
  let cum = 0;
  for (const { symbol, prob } of SEVEN_HAND_WEIGHTS) {
    cum += prob;
    if (r < cum) return [symbol, symbol, 'BAR'];
  }
  return [SEVEN_HAND_WEIGHTS.at(-1)!.symbol, SEVEN_HAND_WEIGHTS.at(-1)!.symbol, 'BAR'];
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
  let cumulative = 0;
  for (const hand of HANDS) {
    cumulative += hand.prob;
    if (r < cumulative) {
      const reels = hand.reels ?? generateMixedSevenBar();
      return { reels, payout: hand.payout };
    }
  }
  return { reels: randomLoss(), payout: 0 };
}
