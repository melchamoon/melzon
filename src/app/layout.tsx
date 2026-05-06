import type { Metadata } from 'next';
import { Noto_Sans_JP, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProviderWrapper } from '@/components/ui/toast';
import { Analytics } from '@vercel/analytics/react';

const noto = Noto_Sans_JP({
  variable: '--font-noto',
  subsets: ['latin'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melzon.vercel.app'),
  title: { default: 'Melzon', template: '%s | Melzon' },
  description: '金ネーム獲得記念。めるちゃもにプレゼントを贈ろう。',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Melzon',
    description: '金ネーム獲得記念。めるちゃもにプレゼントを贈ろう。',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melzon.vercel.app',
    siteName: 'Melzon',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og/default.png'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${noto.variable} ${cormorant.variable}`}>
      <body className="bg-ink-950 text-gold-200 font-sans min-h-screen">
        <ToastProviderWrapper>
          <Header />
          <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">{children}</main>
          <Footer />
        </ToastProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
