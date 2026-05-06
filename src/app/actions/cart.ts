'use server';

import { revalidatePath } from 'next/cache';
import { getCart, setCart } from '@/lib/cookies';
import { addItem, updateQty, removeItem, clearCart as clearCartState } from '@/lib/cart';
import { getProduct } from '@/lib/products';

export async function addToCart(productId: string, qty: number = 1): Promise<void> {
  const product = getProduct(productId);
  if (!product) return;
  const cart = await getCart();
  await setCart(addItem(cart, productId, qty));
  revalidatePath('/cart');
}

export async function updateCartQty(productId: string, qty: number): Promise<void> {
  const cart = await getCart();
  await setCart(updateQty(cart, productId, qty));
  revalidatePath('/cart');
}

export async function removeFromCart(productId: string): Promise<void> {
  const cart = await getCart();
  await setCart(removeItem(cart, productId));
  revalidatePath('/cart');
}

export async function clearCart(): Promise<void> {
  await setCart(clearCartState());
  revalidatePath('/cart');
}
