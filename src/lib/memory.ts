export function payoutByMisses(misses: number): number {
  const table = [100_000_000, 1_000_000, 500_000, 250_000, 150_000, 50_000, 10_000];
  return table[misses] ?? 1_000;
}
