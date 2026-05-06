const MAX_EARN_PER_REQUEST = 1_100_000;

export function clampEarn(points: number): number {
  return Math.max(0, Math.min(MAX_EARN_PER_REQUEST, Math.floor(points)));
}

export function addPoints(balance: number, earned: number): number {
  return balance + clampEarn(earned);
}
