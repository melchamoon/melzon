import type { Cart, CartItem } from '@/types/cart';

const MAX_QTY = 99;
const MAX_ITEMS = 50;

export function addItem(cart: Cart, id: string, qty: number = 1): Cart {
  const existing = cart.items.find((i) => i.id === id);
  if (existing) {
    return {
      items: cart.items.map((i) =>
        i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i,
      ),
    };
  }
  if (cart.items.length >= MAX_ITEMS) return cart;
  return { items: [...cart.items, { id, qty: Math.min(MAX_QTY, qty) }] };
}

export function updateQty(cart: Cart, id: string, qty: number): Cart {
  if (qty <= 0) return removeItem(cart, id);
  return {
    items: cart.items.map((i) =>
      i.id === id ? { ...i, qty: Math.min(MAX_QTY, qty) } : i,
    ),
  };
}

export function removeItem(cart: Cart, id: string): Cart {
  return { items: cart.items.filter((i) => i.id !== id) };
}

export function clearCart(): Cart {
  return { items: [] };
}

export function calcTotal(cart: Cart, prices: Record<string, number>): number {
  return cart.items.reduce((sum, i) => {
    const price = prices[i.id] ?? 0;
    return sum + price * i.qty;
  }, 0);
}

export function toCartItemList(cart: Cart): CartItem[] {
  return cart.items;
}
