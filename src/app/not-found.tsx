import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/layout/PageShell';

export default function NotFound() {
  return (
    <PageShell>
      <div className="text-center py-20 space-y-4">
        <p className="text-6xl">🔍</p>
        <h1 className="text-2xl font-bold text-fg">ページが見つかりません</h1>
        <Button asChild variant="primary">
          <Link href="/">ストアに戻る</Link>
        </Button>
      </div>
    </PageShell>
  );
}
