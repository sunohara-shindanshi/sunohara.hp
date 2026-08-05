import Link from 'next/link';

import { buildBlogHref } from '@/lib/blogUrl';

/**
 * ページ番号方式のページネーション。
 *
 * ※「もっと見る」ボタン方式にするか、この番号方式にするかは要確認事項（README 参照）。
 *   番号方式は各ページが個別 URL を持つためクローラーが全記事に到達でき、JavaScript も不要なので
 *   暫定としてこちらを採用している。方式を変える場合はこのコンポーネントを差し替える。
 */
export default function Pagination({
  currentPage,
  totalPages,
  categorySlug,
}: {
  currentPage: number;
  totalPages: number;
  categorySlug?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const linkBaseClassName =
    'inline-flex min-w-11 justify-center rounded-md border px-4 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent';

  return (
    <nav aria-label="ページ送り" className="mt-12">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={buildBlogHref({ page: currentPage - 1, categorySlug })}
              rel="prev"
              className={`${linkBaseClassName} border-brand-line bg-brand-surface text-brand-navy hover:border-brand-accent hover:text-brand-accent`}
            >
              前へ
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className={`${linkBaseClassName} border-brand-line bg-brand-bg text-brand-muted/60`}
            >
              前へ
            </span>
          )}
        </li>

        {pages.map((page) => (
          <li key={page}>
            {page === currentPage ? (
              <span
                aria-current="page"
                className={`${linkBaseClassName} border-brand-navy bg-brand-navy font-medium text-white`}
              >
                {page}
              </span>
            ) : (
              <Link
                href={buildBlogHref({ page, categorySlug })}
                aria-label={`${page}ページ目`}
                className={`${linkBaseClassName} border-brand-line bg-brand-surface text-brand-navy hover:border-brand-accent hover:text-brand-accent`}
              >
                {page}
              </Link>
            )}
          </li>
        ))}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={buildBlogHref({ page: currentPage + 1, categorySlug })}
              rel="next"
              className={`${linkBaseClassName} border-brand-line bg-brand-surface text-brand-navy hover:border-brand-accent hover:text-brand-accent`}
            >
              次へ
            </Link>
          ) : (
            <span
              aria-hidden="true"
              className={`${linkBaseClassName} border-brand-line bg-brand-bg text-brand-muted/60`}
            >
              次へ
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
