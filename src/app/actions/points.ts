'use server';

import { revalidatePath } from 'next/cache';
import { getPoints, setPoints } from '@/lib/cookies';
import { clampEarn } from '@/lib/points';

export async function earnPoints(input: {
  game: 'slot' | 'click' | 'memory';
  points: number;
}): Promise<{ balance: number }> {
  const current = await getPoints();
  const earned = clampEarn(input.points);
  const balance = current + earned;
  await setPoints(balance);
  revalidatePath('/');
  return { balance };
}
