/**
 * ブログ一覧の URL（ページ番号・カテゴリ絞り込み）を組み立てる唯一の場所。
 * カテゴリナビ・ページネーション・canonical URL がすべてこの関数を使う。
 */
export function buildBlogHref({
  page = 1,
  categorySlug,
}: { page?: number; categorySlug?: string } = {}): string {
  const params = new URLSearchParams();
  // 1 ページ目・絞り込みなしの状態は素の /blog に統一する（同じ内容の URL を増やさない）
  if (categorySlug) params.set('category', categorySlug);
  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `/blog?${query}` : '/blog';
}

/** クエリ文字列のページ番号を 1 以上の整数に正規化する（不正値は 1 とみなす） */
export function parsePageNumber(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return 1;

  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

/** クエリ文字列のカテゴリ slug を取り出す */
export function parseCategorySlug(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ? raw : undefined;
}
