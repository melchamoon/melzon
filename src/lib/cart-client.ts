'use client';

import type { Cart } from '@/types/cart';
import { addItem, updateQty, removeItem } from '@/lib/cart';

const CART_COOKIE = 'melzon_cart';
const MAX_AGE = 60 * 60 * 24 * 30;

function readCartFromCookie(): Cart {
  if (typeof document === 'undefined') return { items: [] };
  const match = document.cookie.split('; ').find((c) => c.startsWith(CART_COOKIE + '='));
  if (!match) return { items: [] };
  try {
    return JSON.parse(decodeURIComponent(match.slice(CART_COOKIE.length + 1))) as Cart;
  } catch {
    return { items: [] };
  }
}

function writeCartToCookie(cart: Cart): void {
  const value = encodeURIComponent(JSON.stringify(cart));
  const expires = new Date(Date.now() + MAX_AGE * 1000).toUTCString();
  document.cookie = `${CART_COOKIE}=${value}; Path=/; Expires=${expires}; SameSite=lax`;
}

export function clientAddToCart(productId: string, qty: number = 1): void {
  writeCartToCookie(addItem(readCartFromCookie(), productId, qty));
}

export function clientUpdateCartQty(productId: string, qty: number): void {
  writeCartToCookie(updateQty(readCartFromCookie(), productId, qty));
}

export function clientRemoveFromCart(productId: string): void {
  writeCartToCookie(removeItem(readCartFromCookie(), productId));
}
