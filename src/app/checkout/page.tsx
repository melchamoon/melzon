'use client';
import { getProducts } from '@/lib/products';
import { CheckoutView } from '@/components/checkout/CheckoutView';
import { PageShell } from '@/components/layout/PageShell';

export default function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutView products={getProducts()} />
    </PageShell>
  );
}
