import { sanitizeRichText } from '@/lib/sanitizeHtml';
import type { TocItem } from '@/types/blog';

/**
 * 記事本文（microCMS のリッチエディタ HTML）を表示用に整える。
 *
 * 1. サニタイズ（許可タグ・許可属性のホワイトリスト）
 * 2. 見出し（h2 / h3）に目次アンカー用の id を振り直す
 * 3. 目次データを組み立てる
 *
 * ※ 2 の走査は正規表現で行っている。対象はサニタイズ済みの HTML（sanitize-html が出力する
 *   タグの対応が取れた安全な部分集合）に限られるため、任意の HTML を正規表現で解析する
 *   一般的な危うさは当てはまらない。生の CMS 出力に対しては絶対に使わないこと。
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

export type PreparedArticleBody = {
  /** 見出しに id を振った、表示用の HTML */
  html: string;
  /** 目次。見出しが 1 つも無い場合は空配列 */
  toc: TocItem[];
};

export function prepareArticleBody(rawHtml: string): PreparedArticleBody {
  const safeHtml = sanitizeRichText(rawHtml);
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
