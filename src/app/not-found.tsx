import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <p className="text-6xl">🔍</p>
      <h1 className="text-2xl font-bold text-fg">ページが見つかりません</h1>
      <Button asChild variant="primary">
        <Link href="/">ストアに戻る</Link>
      </Button>
    </div>
  );
}
