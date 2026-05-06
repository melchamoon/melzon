'use client';
import { getProducts } from '@/lib/products';
import { CheckoutView } from '@/components/checkout/CheckoutView';

export default function CheckoutPage() {
  return <CheckoutView products={getProducts()} />;
}
