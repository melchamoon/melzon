import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';
import { addItem, updateQty, removeItem, clearCart as clearCartState } from '@/lib/cart';
import { getProduct } from '@/lib/products';
import type { Cart } from '@/types/cart';

const CART_COOKIE = 'melzon_cart';
const MAX_AGE = 60 * 60 * 24 * 30;

function readCart(req: NextApiRequest): Cart {
  const cookies = parse(req.headers.cookie ?? '');
  const raw = cookies[CART_COOKIE];
  if (!raw) return { items: [] };
  try {
    return JSON.parse(raw) as Cart;
  } catch {
    return { items: [] };
  }
}

function writeCart(res: NextApiResponse, cart: Cart): void {
  res.setHeader(
    'Set-Cookie',
    serialize(CART_COOKIE, JSON.stringify(cart), {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: MAX_AGE,
    }),
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const body = req.body as { action: string; productId?: string; qty?: number };
  const cart = readCart(req);

  if (body.action === 'add' && body.productId) {
    if (!getProduct(body.productId)) return res.status(404).json({ error: 'not found' });
    writeCart(res, addItem(cart, body.productId, body.qty ?? 1));
    return res.json({ ok: true });
  }

  if (body.action === 'update' && body.productId && body.qty !== undefined) {
    writeCart(res, updateQty(cart, body.productId, body.qty));
    return res.json({ ok: true });
  }

  if (body.action === 'remove' && body.productId) {
    writeCart(res, removeItem(cart, body.productId));
    return res.json({ ok: true });
  }

  if (body.action === 'clear') {
    writeCart(res, clearCartState());
    return res.json({ ok: true });
  }

  return res.status(400).json({ error: 'unknown action' });
}
