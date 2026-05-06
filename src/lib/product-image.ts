import type { Product } from '@/types/product';

export function pickProductImage(product: Product): string {
  const list = product.images;
  if (list.length === 1) return list[0]!;
  return list[Math.floor(Math.random() * list.length)]!;
}
