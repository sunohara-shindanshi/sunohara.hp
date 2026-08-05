import Image from 'next/image';
import Link from 'next/link';

import BrandMotif from '@/components/BrandMotif';
import { formatJapaneseDate } from '@/lib/formatDate';
import type { BlogListItem } from '@/types/blog';

/**
 * ブログ記事一覧のカード。カード全体が記事詳細（/blog/{id}）へのリンクになっている。
 * ※API から取得した値は JSX の中括弧展開のみで挿入する（本文以外で dangerouslySetInnerHTML は使わない）。
 */
export default function BlogCard({ post }: { post: BlogListItem }) {
  const publishedDate = post.publishedAt ? formatJapaneseDate(post.publishedAt) : null;

  return (
    <article className="h-full">
      <Link
        href={`/blog/${post.id}`}
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
              {post.excerpt}
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
