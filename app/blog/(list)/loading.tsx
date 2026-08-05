import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';

/**
 * 記事一覧の取得中に表示される（Next.js の loading.tsx 規約）。
 *
 * ※ (list) というルートグループの中に置いているのは、この loading 境界を「一覧ページだけ」に
 *   限定するため。app/blog 直下に置くと /blog/[id]（記事詳細）にも適用され、
 *   記事ページの HTML が「一覧のスケルトン + hidden な本文」になってしまい SEO 上不利になる。
 */
export default function BlogLoading() {
  return (
    <>
      <PageHeader
        label="Blog"
        title="ブログ"
        description="支援の現場で実際にあった論点や、中小企業の経営に役立つ実務的な情報を掲載しています。"
      />

      <section className="py-14 sm:py-20">
        <Container>
          <p role="status" className="text-sm text-brand-muted">
            記事を読み込んでいます…
          </p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                aria-hidden="true"
                className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface shadow-panel"
              >
                <div className="aspect-[16/9] w-full animate-pulse bg-brand-accentsoft/40" />
                <div className="space-y-3 p-5 sm:p-6">
                  <div className="h-3 w-24 animate-pulse rounded bg-brand-accentsoft/40" />
                  <div className="h-4 w-full animate-pulse rounded bg-brand-accentsoft/40" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-brand-accentsoft/40" />
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
