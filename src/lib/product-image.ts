import type { Product } from '@/types/product';

const IMAGE_KEY_PREFIX = 'melzon_last_image_';

export function pickProductImage(product: Product): string {
  const list = product.images;
  if (list.length === 1) return list[0]!;

  const key = IMAGE_KEY_PREFIX + product.id;
  let lastIndex = -1;
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isInteger(n) && n >= 0 && n < list.length) lastIndex = n;
    }
  }

  // lastIndex を除いた範囲でランダム選択（均等分布）
  let idx = Math.floor(Math.random() * (list.length - (lastIndex >= 0 ? 1 : 0)));
  if (lastIndex >= 0 && idx >= lastIndex) idx++;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, String(idx));
  }

  return list[idx]!;
}
