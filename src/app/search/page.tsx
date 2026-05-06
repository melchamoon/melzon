'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/products';
import { pickRandom } from '@/lib/recommend';
import { generateDidYouMean } from '@/lib/search';
import { ProductGrid } from '@/components/product/ProductGrid';
import { PageShell } from '@/components/layout/PageShell';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const products = getProducts();
  const recommended = pickRandom(products, 11);
  const didYouMean = generateDidYouMean(query, products);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-fg mb-2">
          「{query}」の検索結果
        </h1>
        <div className="bg-white border border-[color:var(--color-line)] p-4" data-testid="did-you-mean">
          <p className="text-fg text-sm">
            もしかして:{' '}
            <Link
              href={`/products/${didYouMean.product.id}`}
              className="text-link font-bold underline hover:text-link-hover"
            >
              「{didYouMean.suggestion}」
            </Link>
            ？
          </p>
        </div>
      </div>

      <p className="text-fg-muted text-sm">該当する商品はありませんでした</p>

      <section>
        <h2 className="text-lg font-bold text-fg mb-4">あなたへのおすすめ</h2>
        <ProductGrid products={recommended} />
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <PageShell>
      <Suspense>
        <SearchContent />
      </Suspense>
    </PageShell>
  );
}
