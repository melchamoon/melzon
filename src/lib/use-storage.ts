'use client';

import { useSyncExternalStore } from 'react';
import {
  subscribePoints,
  readPoints,
  subscribeCart,
  readCart,
  subscribeLastOrder,
  readLastOrder,
} from '@/lib/storage';
import type { Cart } from '@/types/cart';
import type { PresentSummary } from '@/types/game';

const EMPTY_CART: Cart = { items: [] };

export function usePoints(): number {
  return useSyncExternalStore(subscribePoints, readPoints, () => 0);
}

export function useCart(): Cart {
  return useSyncExternalStore(subscribeCart, readCart, () => EMPTY_CART);
}

export function useLastOrder(): PresentSummary | null {
  return useSyncExternalStore(subscribeLastOrder, readLastOrder, () => null);
}
