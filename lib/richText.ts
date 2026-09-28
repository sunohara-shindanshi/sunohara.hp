import { buildBlogPostHref } from '@/lib/blogUrl';
import { formatJapaneseDate } from '@/lib/formatDate';
import { fetchBlogListItemById } from '@/lib/microcms';
import { sanitizeRichText, toWebpIfMicroCMS } from '@/lib/sanitizeHtml';
import { SITE_URL } from '@/lib/siteConfig';
import type { TocItem } from '@/types/blog';

/**
 * 記事本文（microCMS のリッチエディタ HTML）を表示用に整える。
 *
 * 1. サニタイズ（許可タグ・許可属性のホワイトリスト）
 * 2. 「埋め込み」リンク（下記参照）を、記事情報付きのカードに差し替える
 * 3. 見出し（h2 / h3）に目次アンカー用の id を振り直す
 * 4. 目次データを組み立てる
 *
 * ※ 3 の走査は正規表現で行っている。対象はサニタイズ済みの HTML（sanitize-html が出力する
 *   タグの対応が取れた安全な部分集合）に限られるため、任意の HTML を正規表現で解析する
 *   一般的な危うさは当てはまらない。生の CMS 出力に対しては絶対に使わないこと。
 *
 * ※ 2 で組み立てるカードの HTML は、この後 sanitizeRichText を再度通さない
 *   （sanitize-html の許可タグ・属性が本文用の狭いホワイトリストのため、独自の
 *   カード用マークアップ自体が消されてしまう）。そのため、カードに差し込む文字列
 *   （記事タイトル・カテゴリ名・日付など）は必ず escapeHtml を通してから使うこと。
 *   URL 自体は sanitizeRichText 側で allowedSchemes（http/https/mailto/tel）を
 *   通過済みの値のみが対象になる。
 */

/** 目次に載せる見出しレベル */
const HEADING_PATTERN = /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;

/** 属性文字列から既存の id を取り除く（CMS 側で付いていた id は採用しない） */
function stripIdAttribute(attributes: string): string {
  return attributes.replace(/\s+id\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

/** 見出しの中身からタグを取り除き、実体参照を戻して目次の表示文言にする */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * microCMS の「埋め込み」（Iframely 埋め込み）が、サニタイズ後に残す痕跡。
 *
 * 埋め込みは本来 <div class="iframely-embed">...<a data-iframely-url="...">...</div> と、
 * それを実際のカードに描画する <script src="https://iframely.net/embed.js"> の組で
 * 成り立っている。div・data-* 属性・script はいずれも許可リストに無いため、
 * sanitizeRichText を通すと表示テキストの無い <a href="URL"></a> だけが残る
 * （通常、本文リンクは必ず表示テキストを持つため、空リンクはこのパターンでしか生じない）。
 */
const EMPTY_EMBED_LINK_PATTERN = /<a href="([^"]*)">\s*<\/a>/g;

/** 自前で組み立てる HTML への差し込み用に、HTML の特殊文字をエスケープする */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 埋め込みリンクの URL から YouTube の動画情報を取り出す。
 *
 * ※ YouTube の「視聴用 URL」（youtube.com/watch?v=…）は <iframe> に直接入れても再生できない
 *   （YouTube 側がそのページのフレーム表示を許可していないため）。実際に再生できるのは
 *   「埋め込み用 URL」（youtube.com/embed/動画ID）だけ。
 *   microCMS の「埋め込み」は URL を貼るだけの汎用機能（Iframely）で、貼った URL の形式を
 *   問わずそのまま href に残すため、視聴用 URL・短縮 URL（youtu.be）・埋め込み用 URL の
 *   どれが貼られても、ここで動画 ID だけを取り出して埋め込み用 URL に統一する。
 * 対応する形式：
 *   - https://www.youtube.com/watch?v=動画ID（視聴用。モバイル版 m.youtube.com も同様）
 *   - https://youtu.be/動画ID（短縮 URL）
 *   - https://www.youtube.com/embed/動画ID（埋め込み用。そのまま）
 *   - https://www.youtube.com/shorts/動画ID（ショート動画）
 * 開始位置（?t=90 や ?t=1m30s 等）が付いていれば、そのまま再生開始位置として引き継ぐ。
 */
function extractYouTubeVideo(href: string): { videoId: string; startSeconds: number | null } | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m)\./, '');
  if (host !== 'youtube.com' && host !== 'youtu.be' && host !== 'youtube-nocookie.com') return null;

  let videoId: string | null = null;
  if (host === 'youtu.be') {
    videoId = url.pathname.slice(1).split('/')[0] || null;
  } else if (url.pathname === '/watch') {
    videoId = url.searchParams.get('v');
  } else {
    videoId = /^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[1] ?? null;
  }

  // 動画 ID は英数字とハイフン・アンダースコアのみ（YouTube の仕様に合わせた簡易チェック）。
  // 想定外の値をそのまま iframe の src に使わないための最低限の検証。
  if (!videoId || !/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) return null;

  const rawStart = url.searchParams.get('t') ?? url.searchParams.get('start');
  return { videoId, startSeconds: rawStart ? parseYouTubeTimestamp(rawStart) : null };
}

/** YouTube の時間指定（90 / 90s / 1m30s / 1h2m3s）を秒数に変換する */
function parseYouTubeTimestamp(value: string): number | null {
  if (/^\d+$/.test(value)) return Number(value);

  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  if (!match || (!match[1] && !match[2] && !match[3])) return null;

  return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

/** リンク先が自サイトの記事 URL（/blog/{id}）なら、そのコンテンツ ID を返す */
function extractInternalArticleId(href: string): string | null {
  try {
    const url = new URL(href, SITE_URL);
    if (url.origin !== new URL(SITE_URL).origin) return null;

    const match = /^\/blog\/([^/?#]+)\/?$/.exec(url.pathname);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * 埋め込みリンク 1 件分の置き換え先 HTML を組み立てる。
 * - YouTube の URL（視聴用・短縮・埋め込み用のどれでも）なら、再生できる動画プレーヤーにする。
 * - 自サイトの記事 URL なら、記事情報（サムネイル・カテゴリ・タイトル・公開日）付きのカードにする。
 * - それ以外（外部 URL・削除済みの記事など）は、URL をそのまま見せるリンクにする
 *   （元の空リンクのまま＝見えないリンクにはしない）。
 */
async function buildEmbeddedLinkReplacement(rawHref: string): Promise<string> {
  // sanitize-html は属性値中の & を &amp; にエスケープして出力するため、URL として使う前に戻す
  const href = rawHref.replace(/&amp;/g, '&');

  const youtube = extractYouTubeVideo(href);
  if (youtube) {
    // youtube-nocookie.com は Google が提供するプライバシー配慮版の埋め込みドメイン
    // （動画を再生するまで Cookie を設定しない）。動作は通常の embed URL と同じ。
    const src =
      `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube.videoId)}` +
      (youtube.startSeconds ? `?start=${youtube.startSeconds}` : '');

    return (
      '<span class="not-prose article-embed-video">' +
      `<iframe src="${escapeHtml(src)}" title="YouTube 動画" loading="lazy" allowfullscreen ` +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
      '</span>'
    );
  }

  const articleId = extractInternalArticleId(href);

  if (articleId) {
    const post = await fetchBlogListItemById(articleId).catch(() => null);
    if (post) {
      const category = post.categories[0]?.name;
      const date = post.publishedAt ? formatJapaneseDate(post.publishedAt) : null;
      const thumbnail = post.thumbnail
        ? `<span class="article-embed-card__thumb"><img src="${escapeHtml(
            toWebpIfMicroCMS(post.thumbnail.url),
          )}" alt="${escapeHtml(post.thumbnailAlt)}" loading="lazy" /></span>`
        : '';

      return (
        `<a href="${escapeHtml(buildBlogPostHref(post.id))}" class="not-prose article-embed-card">` +
        thumbnail +
        '<span class="article-embed-card__body">' +
        (category ? `<span class="article-embed-card__category">${escapeHtml(category)}</span>` : '') +
        `<span class="article-embed-card__title">${escapeHtml(post.title)}</span>` +
        (date ? `<span class="article-embed-card__date">${escapeHtml(date)}</span>` : '') +
        '</span></a>'
      );
    }
  }

  return `<a href="${escapeHtml(href)}" class="not-prose article-embed-link-fallback" target="_blank" rel="noopener noreferrer">${escapeHtml(href)}</a>`;
}

/**
 * サニタイズ後の本文から埋め込みリンクを探し、カード（または安全なフォールバックリンク）に差し替える。
 * 埋め込みが 1 つも無い本文がほとんどのため、その場合は早期に元の文字列をそのまま返す。
 */
async function resolveEmbeddedLinkCards(html: string): Promise<string> {
  const matches = [...html.matchAll(EMPTY_EMBED_LINK_PATTERN)];
  if (matches.length === 0) return html;

  const replacements = await Promise.all(
    matches.map((match) => buildEmbeddedLinkReplacement(match[1])),
  );

  let result = '';
  let lastIndex = 0;
  matches.forEach((match, i) => {
    const matchIndex = match.index ?? 0;
    result += html.slice(lastIndex, matchIndex);
    result += replacements[i];
    lastIndex = matchIndex + match[0].length;
  });
  result += html.slice(lastIndex);

  return result;
}

export type PreparedArticleBody = {
  /** 見出しに id を振った、表示用の HTML */
  html: string;
  /** 目次。見出しが 1 つも無い場合は空配列 */
  toc: TocItem[];
};

/**
 * 記事以外のリッチエディタ本文（事業内容ページの各ブロックの詳細など）を表示用に整える。
 * サニタイズと埋め込みリンクの差し替えだけを行い、見出しの id 振り・目次の組み立ては行わない
 * （1 ページに本文が複数あるため、prepareArticleBody を使うと id が重複してしまう）。
 */
export async function prepareRichTextFragment(rawHtml: string): Promise<string> {
  return resolveEmbeddedLinkCards(sanitizeRichText(rawHtml));
}

export async function prepareArticleBody(rawHtml: string): Promise<PreparedArticleBody> {
  const sanitized = sanitizeRichText(rawHtml);
  const safeHtml = await resolveEmbeddedLinkCards(sanitized);
  const toc: TocItem[] = [];
  let index = 0;

  const html = safeHtml.replace(
    HEADING_PATTERN,
    (_match, tagName: string, attributes: string, inner: string) => {
      const text = toPlainText(inner);
      // 見出しが空（画像だけ等）の場合は目次に載せず、id も振らない
      if (!text) return _match;

      index += 1;
      const id = `heading-${index}`;
      const level = tagName.toLowerCase() === 'h2' ? 2 : 3;
      toc.push({ id, text, level });

      return `<${tagName}${stripIdAttribute(attributes)} id="${id}">${inner}</${tagName}>`;
    },
  );

  return { html, toc };
}
