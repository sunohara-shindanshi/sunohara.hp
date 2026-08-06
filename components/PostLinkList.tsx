import Image from 'next/image';
import Link from 'next/link';

import BrandMotif from '@/components/BrandMotif';
import { buildArticleListItemParams } from '@/lib/analytics/article';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { buildBlogPostHref } from '@/lib/blogUrl';
import { formatJapaneseDate } from '@/lib/formatDate';
import type { BlogListItem } from '@/types/blog';

/**
 * 記事詳細ページの内部リンク用リスト（おすすめ・関連記事・最近の投稿）。
 * サイト内の回遊性と、クローラーが記事へ到達する経路を確保するために設置している。
 *
 * 計測：記事ページ内から表示する場合（fromArticleId あり）は related_article_click、
 * それ以外の一覧としての利用では article_select を送る。
 */
export default function PostLinkList({
  heading,
  posts,
  emptyMessage,
  listName,
  fromArticleId,
}: {
  heading: string;
  posts: readonly BlogListItem[];
  /** 該当記事がない場合に表示する文言（省略時はセクションごと非表示） */
  emptyMessage?: string;
  /** 計測上のリスト名（例: recommended / related / recent） */
  listName: string;
  /** 遷移元の記事 ID。記事詳細ページから使う場合に渡す。 */
  fromArticleId?: string;
}) {
  if (posts.length === 0 && !emptyMessage) return null;

  return (
    <section className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-panel">
      <h2 className="font-display text-lg font-bold tracking-jp text-brand-navy">{heading}</h2>
      <BrandMotif variant="rule" className="mt-3 h-3 w-20 text-brand-accent" />

      {posts.length === 0 ? (
        <p className="mt-5 text-sm leading-relaxed text-brand-muted">{emptyMessage}</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {posts.map((post) => {
            const publishedDate = post.publishedAt ? formatJapaneseDate(post.publishedAt) : null;
            const listItemParams = buildArticleListItemParams(post);
            const trackingAttributes = fromArticleId
              ? analyticsAttributes('related_article_click', {
                  from_article: fromArticleId,
                  to_article: post.id,
                  category: listItemParams.article_category,
                  list_name: listName,
                })
              : analyticsAttributes('article_select', {
                  ...listItemParams,
                  list_name: listName,
                });

            return (
              <li key={post.id}>
                <Link
                  href={buildBlogPostHref(post.id)}
                  {...trackingAttributes}
                  className="group flex gap-4 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                >
                  {/* サムネイルの比率は他のアイキャッチ画像（848:447）に合わせる */}
                  <span className="relative block aspect-[848/447] w-28 shrink-0 overflow-hidden rounded-md bg-brand-bg">
                    {post.thumbnail ? (
                      <Image
                        src={post.thumbnail.url}
                        alt={post.thumbnailAlt}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <BrandMotif variant="mark" className="h-6 w-6 text-brand-accentsoft" />
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    {publishedDate ? (
                      <time dateTime={post.publishedAt} className="text-xs text-brand-muted">
                        {publishedDate}
                      </time>
                    ) : null}
                    <span className="mt-1 line-clamp-2 text-sm font-medium leading-relaxed text-brand-navy group-hover:text-brand-accent">
                      {post.title}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
