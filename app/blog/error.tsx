'use client';

// Next.js の error.tsx は Client Component である必要がある（再試行ボタンで reset() を呼ぶため）。

import { useEffect } from 'react';

import Container from '@/components/Container';
import { siteConfig, telHref } from '@/lib/siteConfig';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 詳細は画面に出さず、コンソール（サーバーログ / ブラウザコンソール）にのみ残す。
    console.error(error);
  }, [error]);

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="rounded-2xl border border-brand-line bg-brand-surface p-8 shadow-panel sm:p-10">
          <p className="font-display text-xl font-bold tracking-jp text-brand-navy">
            記事を取得できませんでした
          </p>
          <p className="mt-4 text-sm leading-loose text-brand-ink">
            ブログ記事の読み込み中に問題が発生しました。時間をおいて再度お試しください。
            お急ぎの場合は、お電話（
            <a
              href={telHref}
              className="rounded font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              {siteConfig.tel}
            </a>
            ）でも承っております。
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex rounded-full bg-brand-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-navysoft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            再読み込みする
          </button>
        </div>
      </Container>
    </section>
  );
}
