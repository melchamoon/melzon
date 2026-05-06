export function payoutByMisses(misses: number): number {
  const table = [1_000_000, 300_000, 100_000, 50_000, 25_000, 10_000, 5_000];
  return table[misses] ?? 1_000;
}
