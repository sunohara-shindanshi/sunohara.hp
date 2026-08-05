import { parseCategorySlug, parsePageNumber } from '@/lib/blogUrl';
import { BLOG_PAGE_SIZE, fetchBlogPosts, fetchCategories } from '@/lib/microcms';
import type { BlogListResult, Category } from '@/types/blog';

/**
 * ブログ一覧のクエリ（ページ番号・カテゴリ）を解決する。
 *
 * page.tsx と generateMetadata の両方から呼ぶことで、
 * 「表示内容」と「メタデータ」の判定ロジックが食い違わないようにしている。
 * 同一リクエスト内の fetch は Next.js 側で重複排除されるため、2 回呼んでも API 呼び出しは増えない。
 */

export type BlogSearchParams = {
  page?: string | string[];
  category?: string | string[];
};

export type BlogQuery = {
  currentPage: number;
  categories: Category[];
  activeCategory: Category | null;
  /** 存在しないカテゴリ slug、または記事が 1 件もないページ番号が指定された状態 */
  isInvalid: boolean;
  result: BlogListResult;
  totalPages: number;
};

export async function resolveBlogQuery(searchParams: BlogSearchParams): Promise<BlogQuery> {
  const currentPage = parsePageNumber(searchParams.page);
  const categorySlug = parseCategorySlug(searchParams.category);

  const categoryResult = await fetchCategories();
  const categories = categoryResult.status === 'ok' ? categoryResult.categories : [];
  const activeCategory = categorySlug
    ? (categories.find((category) => category.slug === categorySlug) ?? null)
    : null;

  // 存在しないカテゴリ slug が指定された場合（誤って全件を表示しない）。
  // カテゴリ API が未設定のときは slug を解決できないため、絞り込みなしとして扱う。
  if (categorySlug && categoryResult.status === 'ok' && !activeCategory) {
    return {
      currentPage,
      categories,
      activeCategory: null,
      isInvalid: true,
      result: { status: 'ok', posts: [], totalCount: 0, pageSize: BLOG_PAGE_SIZE },
      totalPages: 1,
    };
  }

  const result = await fetchBlogPosts({ page: currentPage, categoryId: activeCategory?.id });

  return {
    currentPage,
    categories,
    activeCategory,
    // 範囲外のページ番号（2 ページ目以降で記事が 0 件）
    isInvalid: result.status === 'ok' && currentPage > 1 && result.posts.length === 0,
    result,
    totalPages:
      result.status === 'ok' ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1,
  };
}
