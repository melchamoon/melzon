'use server';

import { redirect } from 'next/navigation';
import { getCart, getPoints, setPoints, setLastOrder, setCart } from '@/lib/cookies';
import { getProducts } from '@/lib/products';
import { clearCart } from '@/lib/cart';
import type { PresentSummary } from '@/types/game';

export async function presentOrder(): Promise<void> {
  const cart = await getCart();
  const points = await getPoints();
  const products = getProducts();

  const items = cart.items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;
      return { id: item.id, name: product.name, qty: item.qty, price: product.price };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (points < total) {
    redirect('/checkout?error=INSUFFICIENT_POINTS');
  }

  const summary: PresentSummary = { items, totalPoints: total };
  await setPoints(points - total);
  await setLastOrder(summary);
  await setCart(clearCart());

  redirect('/complete');
}
