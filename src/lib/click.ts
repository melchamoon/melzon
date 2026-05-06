export function calcClickPt(gauge: number, maxPt: number): number {
  return Math.floor(1 + ((maxPt - 1) * gauge) / 100);
}
