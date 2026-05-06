import { notFound } from 'next/navigation';
import { getProductsByCategory } from '@/lib/products';
import { CATEGORIES } from '@/lib/categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return {};
  return { title: category.label };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
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
