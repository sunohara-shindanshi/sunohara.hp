import Link from 'next/link';

import { buildBlogHref } from '@/lib/blogUrl';
import type { Category } from '@/types/blog';

/**
 * カテゴリ絞り込みナビゲーション。
 * リンク遷移だけで完結するため Server Component のまま実装している（'use client' 不要）。
 */
export default function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: readonly Category[];
  /** 現在絞り込んでいるカテゴリの slug（未指定 = すべて） */
  activeSlug?: string;
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
