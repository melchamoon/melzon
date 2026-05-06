import { z } from 'zod';
import type { Cart } from '@/types/cart';
import type { PresentSummary } from '@/types/game';

export type Listener = () => void;

const MELZON_POINTS = 'melzon_points';
const MELZON_CART = 'melzon_cart';
const MELZON_LAST_ORDER = 'melzon_last_order';

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

function safeParseCart(raw: string): Cart {
  try {
    return cartSchema.parse(JSON.parse(raw));
  } catch {
    return { items: [] };
  }
}

const pointsListeners = new Set<Listener>();
const cartListeners = new Set<Listener>();
const lastOrderListeners = new Set<Listener>();

let _pointsRaw: string | null = null;
let _pointsCache: number = 0;

let _cartRaw: string | null = null;
let _cartCache: Cart = { items: [] };

let _lastOrderRaw: string | null = null;
let _lastOrderCache: PresentSummary | null = null;

let _storageListenerRegistered = false;

function ensureStorageListener(): void {
  if (_storageListenerRegistered || typeof window === 'undefined') return;
  _storageListenerRegistered = true;
  window.addEventListener('storage', (e) => {
    if (e.key === MELZON_POINTS) {
      _pointsRaw = e.newValue;
      const n = Number(e.newValue);
      _pointsCache = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
      pointsListeners.forEach((cb) => cb());
    } else if (e.key === MELZON_CART) {
      _cartRaw = e.newValue;
      _cartCache = e.newValue ? safeParseCart(e.newValue) : { items: [] };
      cartListeners.forEach((cb) => cb());
    } else if (e.key === MELZON_LAST_ORDER) {
      _lastOrderRaw = e.newValue;
      try {
        _lastOrderCache = e.newValue ? (JSON.parse(e.newValue) as PresentSummary) : null;
      } catch {
        _lastOrderCache = null;
      }
      lastOrderListeners.forEach((cb) => cb());
    }
  });
}

export function readPoints(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(MELZON_POINTS);
  if (raw === _pointsRaw) return _pointsCache;
  _pointsRaw = raw;
  const n = Number(raw);
  _pointsCache = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  return _pointsCache;
}

export function writePoints(points: number): void {
  if (typeof window === 'undefined') return;
  const clamped = Math.max(0, Math.floor(points));
  const raw = String(clamped);
  window.localStorage.setItem(MELZON_POINTS, raw);
  _pointsRaw = raw;
  _pointsCache = clamped;
  pointsListeners.forEach((cb) => cb());
}

export function readCart(): Cart {
  if (typeof window === 'undefined') return { items: [] };
  const raw = window.localStorage.getItem(MELZON_CART);
  if (raw === _cartRaw) return _cartCache;
  _cartRaw = raw;
  _cartCache = raw ? safeParseCart(raw) : { items: [] };
  return _cartCache;
}

export function writeCart(cart: Cart): void {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(cart);
  window.localStorage.setItem(MELZON_CART, raw);
  _cartRaw = raw;
  _cartCache = cart;
  cartListeners.forEach((cb) => cb());
}

export function readLastOrder(): PresentSummary | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(MELZON_LAST_ORDER);
  if (raw === _lastOrderRaw) return _lastOrderCache;
  _lastOrderRaw = raw;
  try {
    _lastOrderCache = raw ? (JSON.parse(raw) as PresentSummary) : null;
  } catch {
    _lastOrderCache = null;
  }
  return _lastOrderCache;
}

export function writeLastOrder(s: PresentSummary): void {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(s);
  window.localStorage.setItem(MELZON_LAST_ORDER, raw);
  _lastOrderRaw = raw;
  _lastOrderCache = s;
  lastOrderListeners.forEach((cb) => cb());
}

export function clearLastOrder(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MELZON_LAST_ORDER);
  _lastOrderRaw = null;
  _lastOrderCache = null;
  lastOrderListeners.forEach((cb) => cb());
}

export function subscribePoints(cb: Listener): () => void {
  ensureStorageListener();
  pointsListeners.add(cb);
  return () => pointsListeners.delete(cb);
}

export function subscribeCart(cb: Listener): () => void {
  ensureStorageListener();
  cartListeners.add(cb);
  return () => cartListeners.delete(cb);
}

export function subscribeLastOrder(cb: Listener): () => void {
  ensureStorageListener();
  lastOrderListeners.add(cb);
  return () => lastOrderListeners.delete(cb);
}
