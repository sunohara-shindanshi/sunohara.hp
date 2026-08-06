import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ArticleKeyPoints from '@/components/ArticleKeyPoints';
import BrandMotif from '@/components/BrandMotif';
import Container from '@/components/Container';
import CtaSection from '@/components/CtaSection';
import JsonLd from '@/components/JsonLd';
import PostLinkList from '@/components/PostLinkList';
import RichText from '@/components/RichText';
import TableOfContents from '@/components/TableOfContents';
import { buildBlogHref } from '@/lib/blogUrl';
import { formatJapaneseDate } from '@/lib/formatDate';
import { buildPageMetadata } from '@/lib/metadata';
import { fetchBlogPost, fetchBlogSitemapEntries, fetchLinkedPosts } from '@/lib/microcms';
import { prepareArticleBody } from '@/lib/richText';
import { SITE_URL, siteConfig, telHref } from '@/lib/siteConfig';

type BlogDetailProps = {
  params: Promise<{ id: string }>;
};

/** 関連記事・最近の投稿の表示件数 */
const RELATED_POSTS_LIMIT = 4;
const RECENT_POSTS_LIMIT = 5;

/**
 * 公開済み記事を事前生成する。
 * 一覧に無い新しい記事も表示できるよう、動的なパラメータは既定どおり許可する（dynamicParams）。
 * ビルド時に microCMS へ到達できない場合は空配列を返し、ビルドを失敗させない。
 */
export async function generateStaticParams() {
  try {
    const entries = await fetchBlogSitemapEntries();
    return entries.map((entry) => ({ id: entry.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchBlogPost(id);

  if (!post) {
    return { title: '記事が見つかりません', robots: { index: false, follow: false } };
  }

  const metadata = buildPageMetadata({
    title: post.title,
    // description は excerpt を使う（改行はメタタグ向けに空白へ正規化。未入力ならサイト共通の説明文）
    description: post.excerpt.replace(/\s+/g, ' ').trim() || siteConfig.description,
    path: `/blog/${post.id}`,
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: post.publishedAt,
      ...(post.thumbnail
        ? { images: [{ url: post.thumbnail.url, width: post.thumbnail.width, height: post.thumbnail.height }] }
        : {}),
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { id } = await params;
  const post = await fetchBlogPost(id);

  if (!post) {
    notFound();
  }

  const primaryCategory = post.categories[0];
  const publishedDate = post.publishedAt ? formatJapaneseDate(post.publishedAt) : null;
  // 本文をサニタイズし、見出しに目次用の id を振ったうえで目次データを取り出す
  const { html: bodyHtml, toc } = prepareArticleBody(post.body);

  // 内部リンク：同じカテゴリの記事（関連記事）と、新着記事（最近の投稿）
  const [relatedPosts, recentPosts] = await Promise.all([
    primaryCategory
      ? fetchLinkedPosts({
          categoryId: primaryCategory.id,
          excludeId: post.id,
          limit: RELATED_POSTS_LIMIT,
        })
      : Promise.resolve([]),
    fetchLinkedPosts({ excludeId: post.id, limit: RECENT_POSTS_LIMIT }),
  ]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'ブログ', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.id}` },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.publishedAt,
    mainEntityOfPage: `${SITE_URL}/blog/${post.id}`,
    ...(post.thumbnail ? { image: post.thumbnail.url } : {}),
    ...(post.categories.length > 0
      ? { articleSection: post.categories.map((category) => category.name) }
      : {}),
    author: { '@type': 'Organization', name: siteConfig.name },
    publisher: { '@type': 'Organization', name: siteConfig.name },
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={articleJsonLd} />

      {/* 記事見出し */}
      <section className="relative overflow-hidden bg-sky text-brand-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-sun/45 blur-3xl"
        />
        <BrandMotif
          variant="hero"
          className="pointer-events-none absolute inset-0 h-full w-full text-brand-accent opacity-15"
        />
        <Container className="relative py-12 sm:py-16">
          {/* パンくず（内部リンク） */}
          <nav aria-label="パンくずリスト">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-brand-ink">
              <li>
                <Link
                  href="/"
                  className="rounded text-brand-navy underline underline-offset-4 hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                >
                  ホーム
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/blog"
                  className="rounded text-brand-navy underline underline-offset-4 hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                >
                  ブログ
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="max-w-full truncate font-medium text-brand-navy">
                {post.title}
              </li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            {post.categories.map((category) => (
              <Link
                key={category.id}
                href={buildBlogHref({ categorySlug: category.slug })}
                className="rounded-full border border-brand-accent bg-white/70 px-3 py-1 font-medium text-brand-accent transition-colors hover:bg-brand-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                {category.name}
              </Link>
            ))}
            {publishedDate ? (
              <time dateTime={post.publishedAt} className="text-brand-ink">
                {publishedDate}
              </time>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-jp text-brand-navy sm:text-4xl">
            {post.title}
          </h1>

          {/* ファーストビューの相談導線（電話） */}
          <p className="mt-5 text-sm text-brand-ink">
            経営のご相談：
            <a
              href={telHref}
              className="ml-1 rounded font-bold text-brand-navy underline underline-offset-4 hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              {siteConfig.tel}
            </a>
          </p>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            {/* 本文 */}
            <article>
              {post.thumbnail ? (
                <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-bg">
                  <Image
                    src={post.thumbnail.url}
                    alt={post.thumbnailAlt}
                    fill
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}

              {post.excerpt ? (
                <p className="mb-8 rounded-2xl border-l-2 border-brand-accent bg-brand-surface p-5 text-sm leading-loose text-brand-ink">
                  {post.excerpt}
                </p>
              ) : null}

              {/* この記事でわかること（チェック付き箇条書き） */}
              <ArticleKeyPoints items={post.keyPoints} />

              {/* 目次（本文の見出しから自動生成。開閉式で、クリックすると該当の見出しへ移動する） */}
              <TableOfContents items={toc} />

              {/* 本文が書かれる領域は、青い背景と区別するため白いパネルにする */}
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-panel sm:p-8 lg:p-10">
                <RichText sanitizedHtml={bodyHtml} />
              </div>

              <div className="mt-12 border-t border-brand-line pt-8">
                <Link
                  href="/blog"
                  className="inline-flex rounded font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                >
                  ← 記事一覧へ戻る
                </Link>
              </div>
            </article>

            {/* 内部リンク（おすすめ・関連記事・最近の投稿）。スクロール追従はさせず、末尾まで表示する */}
            <aside className="space-y-6">
              {/* microCMS で手動選択したおすすめの記事（articles）。未選択なら非表示 */}
              <PostLinkList heading="おすすめの記事" posts={post.recommendedPosts} />
              <PostLinkList
                heading={primaryCategory ? `${primaryCategory.name}の関連記事` : '関連記事'}
                posts={relatedPosts}
                emptyMessage="同じカテゴリの記事は現在ありません。"
              />
              <PostLinkList heading="最近の投稿" posts={recentPosts} />
              <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-panel">
                <h2 className="font-display text-lg font-bold tracking-jp text-brand-navy">
                  事業内容
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-brand-ink">
                  記事の内容に関するご相談も承っています。
                </p>
                <Link
                  href="/services"
                  className="mt-4 inline-flex rounded-full border border-brand-navy px-5 py-2.5 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                >
                  支援内容を見る
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* 記事を読み終えた流れでの CTA */}
      <CtaSection
        heading="この記事の内容について、相談してみませんか"
        lead="記事で触れたテーマも、御社の状況に当てはめると答えは変わります。現状を伺い、具体的な進め方を一緒に考えます。"
        buttonLabel="この記事について相談する"
      />
    </>
  );
}
