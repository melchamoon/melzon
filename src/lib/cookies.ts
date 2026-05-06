import { cookies } from 'next/headers';
import { z } from 'zod';
import type { Cart } from '@/types/cart';
import type { PresentSummary } from '@/types/game';

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: false,
};

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .max(50),
});

export async function getCart(): Promise<Cart> {
  const raw = (await cookies()).get('melzon_cart')?.value;
  if (!raw) return { items: [] };
  try {
    return cartSchema.parse(JSON.parse(raw));
  } catch {
    return { items: [] };
  }
}

export async function setCart(cart: Cart): Promise<void> {
  (await cookies()).set('melzon_cart', JSON.stringify(cart), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getPoints(): Promise<number> {
  const raw = (await cookies()).get('melzon_points')?.value;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export async function setPoints(points: number): Promise<void> {
  const safe = Math.max(0, Math.floor(points));
  (await cookies()).set('melzon_points', String(safe), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getLastOrder(): Promise<PresentSummary | null> {
  const raw = (await cookies()).get('melzon_last_order')?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PresentSummary;
  } catch {
    return null;
  }
}

export async function setLastOrder(s: PresentSummary): Promise<void> {
  (await cookies()).set('melzon_last_order', JSON.stringify(s), {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60,
  });
}

export async function clearLastOrder(): Promise<void> {
  (await cookies()).delete('melzon_last_order');
}
