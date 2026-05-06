import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { pickRandom } from '@/lib/recommend';
import { generateDidYouMean } from '@/lib/search';
import { ProductGrid } from '@/components/product/ProductGrid';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q ?? '';
  const products = getProducts();
  const recommended = pickRandom(products, 11);
  const didYouMean = generateDidYouMean(query, products);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display text-gold-400 mb-2">
          「{query}」の検索結果
        </h1>
        <div className="bg-ink-900 border border-gold-800 rounded-lg p-4" data-testid="did-you-mean">
          <p className="text-gold-300 text-sm">
            もしかして:{' '}
            <Link
              href={`/products/${didYouMean.product.id}`}
              className="text-gold-400 font-bold underline hover:text-gold-300"
            >
              「{didYouMean.suggestion}」
            </Link>
            ？
          </p>
        </div>
      </div>

      <p className="text-ink-400 text-sm">該当する商品はありませんでした</p>

      <section>
        <h2 className="text-lg font-display text-gold-400 mb-4">あなたへのおすすめ</h2>
        <ProductGrid products={recommended} />
      </section>
    </div>
  );
}
