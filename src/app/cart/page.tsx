'use client';
import { getProducts } from '@/lib/products';
import { CartView } from '@/components/cart/CartView';
import { PageShell } from '@/components/layout/PageShell';

export default function CartPage() {
  return (
    <PageShell>
      <CartView products={getProducts()} />
    </PageShell>
  );
}
