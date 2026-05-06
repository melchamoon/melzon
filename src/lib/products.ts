import yaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { Product } from '@/types/product';

const productSchema = z.object({
  id: z.string().regex(/^p_\d{3}$/),
  name: z.string().min(1),
  price: z.number().int().min(1).max(1_000_000),
  image: z.string().startsWith('/products/'),
  description: z.string(),
  reviews: z.array(z.string()).min(1).max(3),
  featured: z.boolean().optional(),
  category: z.string().optional(),
});

let cache: Product[] | null = null;

export function getProducts(): Product[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), 'src/data/products.yaml');
  const raw = fs.readFileSync(file, 'utf-8');
  const parsed = yaml.load(raw);
  cache = z.array(productSchema).parse(parsed);
  return cache;
}

export function getProduct(id: string): Product | null {
  return getProducts().find((p) => p.id === id) ?? null;
}

export function getFeaturedProducts(): Product[] {
  return getProducts().filter((p) => p.featured === true);
}

export function getProductsByCategory(category: string): Product[] {
  return getProducts().filter((p) => p.category === category);
}
