import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProduct } from '@/lib/products';
import { formatPoints } from '@/lib/format';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { RatingStars } from '@/components/ui/RatingStars';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description,
    openGraph: { images: [p.image] },
    twitter: { images: [p.image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 bg-white p-4 border border-[color:var(--color-line)]">
      <div className="aspect-square bg-white overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-full object-contain"
          unoptimized
          priority
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-medium text-fg leading-tight">
          {product.name}
        </h1>

        <RatingStars value={5} reviewCount={product.reviews.length} />

        <p className="text-price font-bold" data-testid="product-price">
          <span className="text-3xl">{formatPoints(product.price)}</span>
          <span className="text-sm ml-1 text-fg-muted">pt</span>
        </p>

        <AddToCartButton productId={product.id} />

        <div className="border-t border-[color:var(--color-line)] pt-4">
          <p className="text-fg text-sm whitespace-pre-wrap leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="border-t border-[color:var(--color-line)] pt-4 space-y-3">
          <h2 className="text-lg font-bold text-fg">レビュー</h2>
          {product.reviews.map((review, i) => (
            <div key={i} className="bg-surface-soft border border-[color:var(--color-line)] border-b border-b-[color:var(--color-line)] py-3 px-3 rounded-sm">
              <RatingStars value={5} />
              <p className="text-fg text-sm mt-1">{review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
