'use client';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/products';
import { ProductHeroImage } from '@/components/product/ProductHeroImage';
import { RatingStars } from '@/components/ui/RatingStars';
import { BuyBox } from '@/components/product/BuyBox';
import { PageShell } from '@/components/layout/PageShell';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <PageShell>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_2fr_320px] gap-6 bg-white p-4 lg:p-6">
        {/* 画像 */}
        <div className="aspect-square bg-white overflow-hidden md:row-span-2 lg:row-span-1">
          <ProductHeroImage product={product} />
        </div>

        {/* 中央：商品情報 */}
        <div className="space-y-4 md:col-start-2 md:row-start-1 lg:col-start-2 lg:row-start-1">
          <h1 className="text-2xl font-medium text-fg leading-tight">
            {product.name}
          </h1>

          <RatingStars value={5} reviewCount={product.reviews.length} />

          <div className="border-t border-[color:var(--color-line)] pt-4">
            <p className="text-fg text-sm whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border-t border-[color:var(--color-line)] pt-4 space-y-3">
            <h2 className="text-lg font-bold text-fg">レビュー</h2>
            {product.reviews.map((review, i) => (
              <div key={i} className="bg-surface-soft border border-[color:var(--color-line)] py-3 px-3 rounded-sm">
                <RatingStars value={5} />
                <p className="text-fg text-sm mt-1">{review}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 右：BuyBox */}
        <div className="md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1">
          <BuyBox productId={product.id} price={product.price} />
        </div>
      </div>
    </PageShell>
  );
}
