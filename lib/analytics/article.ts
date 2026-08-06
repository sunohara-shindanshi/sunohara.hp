import { buildBlogPostHref, extractBlogPostSlug } from '@/lib/blogUrl';
import type { ArticleEventParams } from '@/lib/analytics/events';
import { siteConfig } from '@/lib/siteConfig';
import type { BlogListItem, BlogPost } from '@/types/blog';

/**
 * 記事データから計測用パラメータを組み立てる、唯一の場所。
 *
 * 記事が増えても、この関数を通すだけで article_id / article_slug / word_count / … が
 * 自動で付くため、新しい記事を追加してもコード修正は不要。
 * ※ microCMS 側に tags / author フィールドが無い場合は、
 *   その項目だけ既定値になる（フィールドを作れば自動的に反映される）。
 */

/** 日本語の平均読書速度（文字／分）。reading_time の算出基準。 */
const CHARS_PER_MINUTE = 500;

/** ISO 8601 の日時を GA4 で扱いやすい YYYY-MM-DD に整える */
function toDateString(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const matched = /^\d{4}-\d{2}-\d{2}/.exec(value);
  return matched ? matched[0] : undefined;
}

/** YYYY-MM-DD から年（数値）を取り出す */
function toYear(dateString: string | undefined): number | undefined {
  if (!dateString) return undefined;
  const year = Number(dateString.slice(0, 4));
  return Number.isInteger(year) ? year : undefined;
}

/**
 * 公開後に更新されているかを判定する。
 * 日付（YYYY-MM-DD）で比較するため、公開と同じ日の更新は false になる。
 * どちらかの日付が取得できない場合も false（「更新あり」と誤って集計しないため）。
 */
function toIsUpdated(publishDate: string | undefined, updatedDate: string | undefined): boolean {
  if (!publishDate || !updatedDate) return false;
  return updatedDate > publishDate;
}

/** 名前の配列をカンマ区切りにする（GA4 のパラメータは文字列で扱うため） */
function joinNames(names: readonly string[]): string | undefined {
  const joined = names.filter((name) => name.length > 0).join(',');
  return joined.length > 0 ? joined : undefined;
}

/**
 * 記事の slug。
 *
 * 記事 URL（/blog/{id}）の末尾から取得する。
 * 現在の URL 設計ではコンテンツ ID がそのまま URL になるため、値は article_id と同じになるが、
 * article_slug は「URL 上の識別子」として定義しているため別パラメータとして送っている
 * （GA4 の page_path や Looker Studio の URL と突き合わせるときに、そのまま使えるようにするため）。
 * URL の形を変えた場合は buildBlogPostHref を直せば計測値も自動で追従する。
 */
export function getArticleSlug(post: BlogListItem): string {
  return extractBlogPostSlug(buildBlogPostHref(post.id));
}

/**
 * リッチエディタの HTML から本文テキストだけを取り出す。
 * 文字数カウントのための簡易処理で、表示には使わない
 * （表示用のサニタイズは lib/sanitizeHtml.ts が担当する）。
 */
function extractPlainText(html: string): string {
  return (
    html
      // script / style の中身は本文ではないので、タグごと中身を捨てる
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
      // ブロック要素の境目が単語の切れ目として残るよう、タグは空白に置き換える
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      // &amp; は最後に戻す（先に戻すと &amp;lt; が二重に復元されるため）
      .replace(/&amp;/g, '&')
  );
}

/** 本文の文字数（HTML タグ・空白・改行を除いた実文字数） */
export function countArticleCharacters(body: string): number {
  return extractPlainText(body).replace(/\s/g, '').length;
}

/** 推定読了時間（分・整数）。0 分にならないよう最低 1 分とする。 */
export function estimateReadingTime(characterCount: number): number {
  if (characterCount <= 0) return 0;
  return Math.max(1, Math.ceil(characterCount / CHARS_PER_MINUTE));
}

/**
 * 記事一覧の 1 件（BlogListItem）から、一覧クリック計測に使う値を取り出す。
 * ※ 一覧 API は本文を取得しないため word_count / reading_time は含まれない
 *   （記事ページへ遷移した後のイベントで取得できる）。
 */
export function buildArticleListItemParams(post: BlogListItem): {
  article_id: string;
  article_slug: string;
  article_title: string;
  article_category?: string;
  article_tags?: string;
  publish_date?: string;
  publish_year?: number;
  updated_date?: string;
  is_updated: boolean;
} {
  const publishDate = toDateString(post.publishedAt);
  const updatedDate = toDateString(post.updatedAt);

  return {
    article_id: post.id,
    article_slug: getArticleSlug(post),
    article_title: post.title,
    article_category: joinNames(post.categories.map((category) => category.name)),
    article_tags: joinNames(post.tags.map((tag) => tag.name)),
    publish_date: publishDate,
    publish_year: toYear(publishDate),
    updated_date: updatedDate,
    is_updated: toIsUpdated(publishDate, updatedDate),
  };
}

/**
 * 記事詳細ページのコンテキスト（そのページの全イベントに付与される）。
 * 一覧の項目 + 本文から算出する文字数・読了時間 + 執筆者。
 * author は記事側に指定が無ければ代表者名を既定値にする。
 */
export function buildArticleAnalyticsParams(post: BlogPost): ArticleEventParams {
  const wordCount = countArticleCharacters(post.body);

  return {
    ...buildArticleListItemParams(post),
    word_count: wordCount,
    reading_time: estimateReadingTime(wordCount),
    author: post.author ?? siteConfig.representative.name,
  };
}
