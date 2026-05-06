import { PRODUCTS } from '@/data/products.generated';
import type { Product } from '@/types/product';

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(id: string): Product | null {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured === true);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export { pickProductImage } from '@/lib/product-image';
