import Image from 'next/image';
import Link from 'next/link';

import BrandMotif from '@/components/BrandMotif';
import { formatJapaneseDate } from '@/lib/formatDate';
import type { BlogListItem } from '@/types/blog';

/**
 * 記事詳細ページの内部リンク用リスト（関連記事・最近の投稿）。
 * サイト内の回遊性と、クローラーが記事へ到達する経路を確保するために設置している。
 */
export default function PostLinkList({
  heading,
  posts,
  emptyMessage,
}: {
  heading: string;
  posts: readonly BlogListItem[];
  /** 該当記事がない場合に表示する文言（省略時はセクションごと非表示） */
  emptyMessage?: string;
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
            return (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.id}`}
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
