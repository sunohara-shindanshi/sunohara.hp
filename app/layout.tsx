import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SITE_URL, siteConfig } from '@/lib/siteConfig';

import './globals.css';

/**
 * サイト全体の書体：Noto Sans JP（可変フォント）。
 *
 * 見出し・本文・キャッチフレーズをすべてこの 1 書体に統一している（tailwind.config.ts の fontFamily）。
 * 可変フォントのため weight は指定せず、太字（font-bold）は同じフォントファイルの太さで表現される。
 * display: 'swap' で、フォント待ちによる文字の非表示（FOIT）を避ける。
 */
const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // 各ページは title に「事業内容」のようなページ名だけを指定すればよい
    default: `${siteConfig.name}｜${siteConfig.catchphrase}`,
    template: `%s｜${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <head>
        {/* microCMS の画像配信ドメインへの接続を先に確立し、記事サムネイルの表示を早める */}
        <link rel="preconnect" href="https://images.microcms-assets.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.microcms-assets.io" />
      </head>
      <body className="flex min-h-screen flex-col bg-brand-bg font-sans text-brand-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand-navy focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          本文へスキップ
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
