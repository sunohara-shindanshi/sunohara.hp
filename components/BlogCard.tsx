import Image from 'next/image';
import Link from 'next/link';

import BrandMotif from '@/components/BrandMotif';
import { buildArticleListItemParams } from '@/lib/analytics/article';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { buildBlogPostHref } from '@/lib/blogUrl';
import { formatJapaneseDate } from '@/lib/formatDate';
import type { BlogListItem } from '@/types/blog';

/**
 * ブログ記事一覧のカード。カード全体が記事詳細（/blog/{id}）へのリンクになっている。
 * ※API から取得した値は JSX の中括弧展開のみで挿入する（本文以外で dangerouslySetInnerHTML は使わない）。
 *
 * クリックは article_select として自動計測される。記事情報は post から組み立てるため、
 * 記事が増えても計測用のコードを書き足す必要はない。
 */
export default function BlogCard({
  post,
  listName,
}: {
  post: BlogListItem;
  /** どの一覧に置かれたカードか（計測の list_name。例: blog_list / home_recent） */
  listName?: string;
}) {
  const publishedDate = post.publishedAt ? formatJapaneseDate(post.publishedAt) : null;

  return (
    <article className="h-full">
      <Link
        href={buildBlogPostHref(post.id)}
        {...analyticsAttributes('article_select', {
          ...buildArticleListItemParams(post),
          list_name: listName,
        })}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface shadow-panel transition-colors hover:border-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-bg">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail.url}
              // alt は microCMS の thumbnailAlt フィールドを使う。
              // 未入力の場合は、隣にタイトルがある装飾画像として空文字（＝読み上げ対象外）にする。
              alt={post.thumbnailAlt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            // サムネイル未設定時のフォールバック（ブランドモチーフを流用し、画像アセットを増やさない）
            <div className="flex h-full w-full items-center justify-center">
              <BrandMotif variant="mark" className="h-10 w-10 text-brand-accentsoft" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-brand-bg px-3 py-1 font-medium text-brand-accent"
              >
                {category.name}
              </span>
            ))}
            {publishedDate ? <time dateTime={post.publishedAt}>{publishedDate}</time> : null}
          </div>
          <h3 className="mt-3 font-display text-lg font-bold leading-relaxed tracking-jp text-brand-navy">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-brand-ink">
              {/*
                data-nosnippet：この抜粋文を Google の検索スニペットに使わせない。
                カードが置かれるのはトップページとブログ一覧で、そのページ自身の説明文ではないため、
                ここが検索結果の説明文に採用されると内容がちぐはぐになる
                （例：トップページの検索結果に、記事の自己紹介文が出てしまう）。
                クロール・インデックス自体は妨げないので、記事へのリンク評価には影響しない。
                ※ 属性は span / div / section にのみ有効（Google の仕様）。
              */}
              <span data-nosnippet="">{post.excerpt}</span>
            </p>
          ) : null}
          <span
            aria-hidden="true"
            className="mt-auto pt-5 text-sm font-medium text-brand-accent"
          >
            続きを読む →
          </span>
        </div>
      </Link>
    </article>
  );
}
