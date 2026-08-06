import Link from 'next/link';

import { analyticsAttributes } from '@/lib/analytics/attributes';
import { buildBlogHref } from '@/lib/blogUrl';
import type { Category } from '@/types/blog';

/**
 * カテゴリ絞り込みナビゲーション。
 * リンク遷移だけで完結するため Server Component のまま実装している（'use client' 不要）。
 *
 * 計測：クリックは category_select として送る（data 属性による自動計測）。
 * カテゴリが増えてもコード修正は不要。
 */
export default function CategoryFilter({
  categories,
  activeSlug,
  listName = 'blog_category_filter',
}: {
  categories: readonly Category[];
  /** 現在絞り込んでいるカテゴリの slug（未指定 = すべて） */
  activeSlug?: string;
  /** 計測上の設置場所（同じ UI を別の場所にも置く場合に区別する） */
  listName?: string;
}) {
  if (categories.length === 0) return null;

  const items = [
    { slug: undefined, name: 'すべて' },
    ...categories.map((category) => ({ slug: category.slug, name: category.name })),
  ];

  return (
    <nav aria-label="カテゴリ" className="mb-10">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <li key={item.slug ?? 'all'}>
              <Link
                href={buildBlogHref({ categorySlug: item.slug })}
                aria-current={isActive ? 'page' : undefined}
                {...analyticsAttributes('category_select', {
                  category_name: item.name,
                  category_slug: item.slug,
                  list_name: listName,
                })}
                className={`inline-flex rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
                  isActive
                    ? 'border-brand-navy bg-brand-navy font-medium text-white'
                    : 'border-brand-line bg-brand-surface text-brand-navy hover:border-brand-accent hover:text-brand-accent'
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
