import type { Product } from '@/types/product';
import { pickRandom } from './recommend';

function gyaku(name: string): string {
  return [...name].reverse().join('');
}

function melPrefix(name: string): string {
  return `めるちゃも風${name}`;
}

function kanjiBreak(name: string): string {
  const hiraganaMap: Record<string, string> = {
    金: 'きん',
    鮭: 'さけ',
    像: 'ぞう',
    箱: 'はこ',
    色: 'いろ',
    純: 'じゅん',
    黄: 'おう',
    石: 'いし',
    缶: 'かん',
    粉: 'こな',
    煮: 'に',
    干: 'ぼし',
    領: 'りょう',
    収: 'しゅう',
  };
  let replaced = false;
  return [...name]
    .map((ch) => {
      if (!replaced && hiraganaMap[ch]) {
        replaced = true;
        return hiraganaMap[ch];
      }
      return ch;
    })
    .join('');
}

function vowelShuffle(name: string): string {
  const vowels = ['あ', 'い', 'う', 'え', 'お', 'ゃ', 'ゅ', 'ょ'];
  const chars = [...name];
  const vowelIndices = chars
    .map((c, i) => (vowels.includes(c) ? i : -1))
    .filter((i) => i >= 0);
  if (vowelIndices.length < 2) return melPrefix(name);
  const [i1, i2] = [vowelIndices[0]!, vowelIndices[vowelIndices.length - 1]!];
  [chars[i1], chars[i2]] = [chars[i2]!, chars[i1]!];
  return chars.join('');
}

export function generateDidYouMean(
  query: string,
  products: readonly Product[],
): { suggestion: string; product: Product } {
  void query;
  const target = pickRandom(products, 1)[0]!;
  const strategies = [vowelShuffle, gyaku, melPrefix, kanjiBreak];
  const strategy = strategies[Math.floor(Math.random() * strategies.length)]!;
  return { suggestion: strategy(target.name), product: target };
}
