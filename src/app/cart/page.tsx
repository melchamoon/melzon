'use client';
import { getProducts } from '@/lib/products';
import { CartView } from '@/components/cart/CartView';

export default function CartPage() {
  return <CartView products={getProducts()} />;
}
