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

/**
 * 記事詳細ページのパスを組み立てる唯一の場所。
 * カード・関連記事リンク・canonical URL・構造化データがすべてこの関数を使う。
 */
export function buildBlogPostHref(id: string): string {
  return `/blog/${id}`;
}

/**
 * 記事 URL の末尾を slug として取り出す。
 * アクセス解析の article_slug は「URL から自動取得」する方針のため、
 * URL の組み立て（buildBlogPostHref）と対にしてここに置いている。
 * URL の形を変えたときも、計測値が自動で追従する。
 */
export function extractBlogPostSlug(href: string): string {
  return href.split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? '';
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
