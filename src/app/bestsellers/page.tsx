'use client';
import { getFeaturedProducts } from '@/lib/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { PageShell } from '@/components/layout/PageShell';

export default function BestsellersPage() {
  const products = getFeaturedProducts().sort((a, b) => a.id.localeCompare(b.id));

  return (
    <PageShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-fg">ベストセラー</h1>
        {products.length === 0 ? (
          <p className="text-fg/60">商品がありません。</p>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </PageShell>
  );
}
