import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProduct } from '@/lib/products';
import { formatPoints } from '@/lib/format';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

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
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      <div className="bg-ink-900 rounded-xl overflow-hidden self-start">
        <Image
          src={product.image}
          alt={product.name}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto"
          unoptimized
          priority
        />
      </div>

      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-display text-gold-300 leading-tight">
          {product.name}
        </h1>

        <div className="text-gold-500 text-xl">★★★★★</div>

        <p className="text-4xl font-bold text-gold-500" data-testid="product-price">
          {formatPoints(product.price)} pt
        </p>

        <AddToCartButton productId={product.id} />

        <div className="border-t border-gold-900 pt-4">
          <p className="text-gold-200 text-sm whitespace-pre-wrap leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-display text-gold-400">レビュー</h2>
          {product.reviews.map((review, i) => (
            <div key={i} className="bg-ink-900 rounded-lg p-3">
              <div className="text-gold-500 text-xs mb-1">★★★★★</div>
              <p className="text-gold-200 text-sm">{review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
