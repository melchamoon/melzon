import { describe, it, expect } from 'vitest';
import { addItem, updateQty, removeItem, clearCart, calcTotal } from '@/lib/cart';
import type { Cart } from '@/types/cart';

const empty: Cart = { items: [] };

describe('cart', () => {
  it('adds a new item', () => {
    const cart = addItem(empty, 'p_001', 1);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toEqual({ id: 'p_001', qty: 1 });
  });

  it('increments qty for existing item', () => {
    const cart = addItem(addItem(empty, 'p_001', 1), 'p_001', 3);
    expect(cart.items[0]?.qty).toBe(4);
  });

  it('clamps qty at 99', () => {
    const cart = addItem(empty, 'p_001', 100);
    expect(cart.items[0]?.qty).toBe(99);
  });

  it('updateQty sets qty', () => {
    const cart = updateQty(addItem(empty, 'p_001', 1), 'p_001', 5);
    expect(cart.items[0]?.qty).toBe(5);
  });

  it('updateQty removes item when qty <= 0', () => {
    const cart = updateQty(addItem(empty, 'p_001', 1), 'p_001', 0);
    expect(cart.items).toHaveLength(0);
  });

  it('removes an item', () => {
    const cart = removeItem(addItem(empty, 'p_001', 2), 'p_001');
    expect(cart.items).toHaveLength(0);
  });

  it('clearCart returns empty cart', () => {
    const cart = clearCart();
    expect(cart.items).toHaveLength(0);
  });

  it('does not exceed MAX_ITEMS (50)', () => {
    let cart = empty;
    for (let i = 0; i < 55; i++) {
      cart = addItem(cart, `p_${String(i).padStart(3, '0')}`, 1);
    }
    expect(cart.items.length).toBe(50);
  });

  it('calcTotal computes correct sum', () => {
    const cart: Cart = { items: [{ id: 'p_001', qty: 2 }, { id: 'p_002', qty: 1 }] };
    const total = calcTotal(cart, { p_001: 100, p_002: 200 });
    expect(total).toBe(400);
  });
});
