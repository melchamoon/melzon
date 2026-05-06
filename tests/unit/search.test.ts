import { describe, it, expect } from 'vitest';
import { generateDidYouMean } from '@/lib/search';
import type { Product } from '@/types/product';

const products: Product[] = [
  { id: 'p_001', name: '金鮭のフレーク', price: 100, image: '/products/p_001.png', description: '', reviews: ['good'] },
  { id: 'p_002', name: '金のめるちゃも像', price: 200, image: '/products/p_002.png', description: '', reviews: ['nice'] },
];

describe('search', () => {
  it('returns non-empty suggestion', () => {
    const result = generateDidYouMean('test', products);
    expect(result.suggestion).toBeTruthy();
  });

  it('always returns a product', () => {
    const result = generateDidYouMean('anything', products);
    expect(result.product).toBeDefined();
    expect(products.some((p) => p.id === result.product.id)).toBe(true);
  });

  it('suggestion is different from original name in most cases (melPrefix always prefixes)', () => {
    let hasDifference = false;
    for (let i = 0; i < 20; i++) {
      const r = generateDidYouMean('q', products);
      if (r.suggestion !== r.product.name) hasDifference = true;
    }
    expect(hasDifference).toBe(true);
  });
});
