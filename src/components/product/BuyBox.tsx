import { formatPoints } from '@/lib/format';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

type Props = { productId: string; price: number };

export function BuyBox({ productId, price }: Props) {
  return (
    <aside className="bg-white border border-[color:var(--color-line)] rounded-sm p-4 space-y-4 h-fit lg:sticky lg:top-[120px]">
      <p className="text-price font-bold" data-testid="product-price">
        <span className="text-3xl">{formatPoints(price)}</span>
        <span className="text-sm ml-1 text-fg-muted">pt</span>
      </p>

      <p className="text-success font-bold text-sm">在庫あり</p>

      <AddToCartButton productId={productId} />
    </aside>
  );
}
