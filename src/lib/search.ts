import type { Product } from '@/types/product';
import { pickRandom } from './recommend';

export function generateDidYouMean(
  query: string,
  products: readonly Product[],
): { suggestion: string; product: Product } {
  void query;
  const target = pickRandom(products, 1)[0]!;
  return { suggestion: target.name, product: target };
}
