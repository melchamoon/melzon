'use client';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getProductsByCategory } from '@/lib/products';
import { CATEGORIES } from '@/lib/categories';
import { ProductGrid } from '@/components/product/ProductGrid';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = getProductsByCategory(slug).sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-fg">{category.label}</h1>
      {products.length === 0 ? (
        <p className="text-fg/60">商品がありません。</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
