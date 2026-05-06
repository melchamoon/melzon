'use client';

import { buildTweetUrl } from '@/lib/tweet';
import type { PresentSummary } from '@/types/game';

export function TweetButton({ summary }: { summary: PresentSummary }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melzon.vercel.app';
  const url = buildTweetUrl(summary, siteUrl);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
      data-testid="tweet-button"
    >
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
      X に投稿
    </a>
  );
}
