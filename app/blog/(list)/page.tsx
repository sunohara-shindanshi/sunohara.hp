import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { type BlogSearchParams, resolveBlogQuery } from '@/app/blog/queries';
import BlogCard from '@/components/BlogCard';
import CategoryFilter from '@/components/CategoryFilter';
import Container from '@/components/Container';
import CtaSection from '@/components/CtaSection';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import { buildBlogHref } from '@/lib/blogUrl';
import { buildPageMetadata } from '@/lib/metadata';

/** ページ番号・カテゴリはクエリパラメータで受け取る（ルートは /blog のまま） */
type BlogPageProps = {
  searchParams: Promise<BlogSearchParams>;
};

const BASE_DESCRIPTION =
  '財務・資金、組織・人事、営業・売上、IT・システム。経営の現場で気づいたことをまとめています。中小企業の経営に役立つ実務的な情報を発信します。';

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { currentPage: pageNumber, activeCategory, isInvalid } = await resolveBlogQuery(
    await searchParams,
  );

  // 存在しないカテゴリ・範囲外のページ番号のときは 404 表示になる。
  // loading.tsx によるストリーミングが先に始まるため HTTP ステータスは 200 のままなので、
  // 検索エンジンに拾われないよう noindex を明示する。
  if (isInvalid) {
    return {
      title: 'ページが見つかりません',
      robots: { index: false, follow: false },
    };
  }

  const titleBase = activeCategory ? `${activeCategory.name}の記事` : 'ブログ';
  const descriptionBase = activeCategory
    ? `「${activeCategory.name}」に関する記事の一覧です。${BASE_DESCRIPTION}`
    : BASE_DESCRIPTION;

  return buildPageMetadata({
    title: pageNumber > 1 ? `${titleBase}（${pageNumber}ページ目）` : titleBase,
    description: pageNumber > 1 ? `${descriptionBase}（${pageNumber}ページ目）` : descriptionBase,
    // canonical はページ番号・絞り込みを含む実際の URL に合わせる
    path: buildBlogHref({ page: pageNumber, categorySlug: activeCategory?.slug }),
  });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // 取得は Server Component 内で行う。取得失敗時は例外を投げ、app/blog/error.tsx が受け止める。
  const { currentPage, categories, activeCategory, isInvalid, result, totalPages } =
    await resolveBlogQuery(await searchParams);

  // 存在しないカテゴリ slug・範囲外のページ番号は 404 表示にする（誤って全件を表示しないため）
  if (isInvalid) {
    notFound();
  }

  return (
    <>
      <PageHeader
        label="Blog"
        title="ブログ"
        description="支援の現場で実際にあった論点や、中小企業の経営に役立つ実務的な情報を掲載しています。"
        cta={{ label: '経営について相談する', href: '/contact' }}
      />

      <section className="py-14 sm:py-20">
        <Container>
          {categories.length > 0 ? (
            <CategoryFilter categories={categories} activeSlug={activeCategory?.slug} />
          ) : null}

          {result.status === 'not-configured' ? (
            // microCMS の接続情報が未設定の状態。README「microCMS の設定」を参照。
            <div className="rounded-2xl border border-dashed border-brand-accentsoft bg-brand-surface p-8 text-sm leading-loose text-brand-ink sm:p-10">
              <p className="font-display text-lg font-bold tracking-jp text-brand-navy">
                ブログの接続設定が未完了です
              </p>
              <p className="mt-4">
                microCMS の接続情報（環境変数）が設定されていないため、記事を取得していません。
                <code className="mx-1 rounded bg-brand-bg px-1.5 py-0.5 text-xs text-brand-navy">
                  .env.local
                </code>
                に
                <code className="mx-1 rounded bg-brand-bg px-1.5 py-0.5 text-xs text-brand-navy">
                  MICROCMS_SERVICE_DOMAIN
                </code>
                <code className="mx-1 rounded bg-brand-bg px-1.5 py-0.5 text-xs text-brand-navy">
                  MICROCMS_API_KEY
                </code>
                <code className="mx-1 rounded bg-brand-bg px-1.5 py-0.5 text-xs text-brand-navy">
                  MICROCMS_BLOG_ENDPOINT
                </code>
                を設定してください（手順は README を参照）。
              </p>
            </div>
          ) : result.posts.length === 0 ? (
            // 記事 0 件（絞り込みの有無でメッセージを変える）
            <div className="rounded-2xl border border-brand-line bg-brand-surface p-8 text-sm leading-loose text-brand-ink sm:p-10">
              <p className="font-display text-lg font-bold tracking-jp text-brand-navy">
                {activeCategory
                  ? `「${activeCategory.name}」の記事はまだありません`
                  : '公開中の記事はまだありません'}
              </p>
              <p className="mt-4">
                {activeCategory
                  ? '他のカテゴリの記事をご覧ください。'
                  : '現在準備中です。記事の公開までは、お問い合わせページからお気軽にご相談ください。'}
              </p>
              <Link
                href={activeCategory ? buildBlogHref() : '/contact'}
                className="mt-6 inline-flex rounded-full border border-brand-navy px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
              >
                {activeCategory ? 'すべての記事を見る' : 'お問い合わせへ'}
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.posts.map((post) => (
                  <li key={post.id}>
                    <BlogCard post={post} listName="blog_list" />
                  </li>
                ))}
              </ul>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                categorySlug={activeCategory?.slug}
              />
            </>
          )}
        </Container>
      </section>

      {/* 記事を読んだ流れでの CTA（記事がある場合のみ表示） */}
      {result.status === 'ok' && result.posts.length > 0 ? (
        <CtaSection
          heading="記事で気になった点は、そのままご相談ください"
          lead="「うちの場合はどうすれば？」という具体的なご相談も歓迎です。現状を伺い、御社に合わせて考えます。"
          buttonLabel="経営について相談する"
        />
      ) : null}
    </>
  );
}
