import Link from 'next/link';

import { analyticsAttributes } from '@/lib/analytics/attributes';
import type { Tag } from '@/types/blog';

/**
 * 記事のタグ表示。
 *
 * microCMS の blogs に tags フィールドを作ると自動的に表示され、
 * 記事の計測パラメータ（article_tags）にも自動で載る。フィールドが無い間は何も表示しない。
 *
 * getHref を渡すとタグがリンクになり、クリックが tag_select として計測される。
 * ※ 現時点ではタグ別の一覧ページが無いため、呼び出し側は getHref を渡していない
 *   （タグ一覧ページを作ったときに getHref を渡すだけで計測まで有効になる）。
 */
export default function TagList({
  tags,
  getHref,
  listName = 'article_tags',
}: {
  tags: readonly Tag[];
  /** タグのリンク先を作る関数。省略するとリンクにせず、ラベルとして表示する。 */
  getHref?: (tag: Tag) => string;
  /** 計測上の設置場所 */
  listName?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <ul aria-label="タグ" className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag.id}>
          {getHref ? (
            <Link
              href={getHref(tag)}
              {...analyticsAttributes('tag_select', {
                tag_name: tag.name,
                tag_slug: tag.slug,
                list_name: listName,
              })}
              className="inline-flex rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs text-brand-muted transition-colors hover:border-brand-accent hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              #{tag.name}
            </Link>
          ) : (
            <span className="inline-flex rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs text-brand-muted">
              #{tag.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
