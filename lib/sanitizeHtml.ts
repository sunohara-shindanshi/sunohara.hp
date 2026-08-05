import sanitize from 'sanitize-html';

/** microCMS の画像配信ホスト（imgix ベース） */
const MICROCMS_IMAGE_HOST = 'images.microcms-assets.io';

/**
 * microCMS の画像 URL に `fm=webp` を付けて WebP 配信にする。
 * microCMS の画像 API は `auto=format` 非対応のため、`fm=webp` を明示する。
 * microCMS 以外のホストや、すでに fm 指定がある URL はそのまま返す。
 */
function toWebpIfMicroCMS(src: string): string {
  try {
    const url = new URL(src);
    if (url.hostname !== MICROCMS_IMAGE_HOST) return src;
    if (url.searchParams.has('fm')) return src;
    url.searchParams.set('fm', 'webp');
    return url.toString();
  } catch {
    // 相対パスなど URL として解釈できないものは変換しない
    return src;
  }
}

/**
 * microCMS のリッチエディタが返す HTML を、許可タグ・許可属性のホワイトリストで無害化する。
 *
 * 記事本文は HTML 文字列のため、React の中括弧展開では表示できない（タグがそのまま文字として出る）。
 * そのため本文だけは dangerouslySetInnerHTML を使うが、必ずこの関数を通した文字列のみを渡すこと
 * （components/RichText.tsx 以外から dangerouslySetInnerHTML を使わない）。
 *
 * - script / style / iframe / on* 属性 / javascript: スキームはすべて除去される
 * - 外部リンクには rel="noopener noreferrer" を付与する
 */
export function sanitizeRichText(html: string): string {
  return sanitize(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'blockquote',
      'ul',
      'ol',
      'li',
      // 見出しは下の transformTags で 1 段ずつ下げる（h1→h2, h2→h3 …）。
      // ページの h1 は記事タイトルの 1 つだけにし、リッチエディタの見出し階層を保つため。
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'img',
      'figure',
      'figcaption',
      'code',
      'pre',
      'hr',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      // 見出しの id は目次（lib/richText.ts）からのアンカー用。
      // CMS 側で付いていた id は lib/richText.ts で必ず付け直すため、そのまま残ることはない。
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      // リッチエディタのカスタムclass / 文字装飾で付与されるクラス。
      // 「コラム（囲み枠）」は microCMS で class="column" を付けると、app/globals.css の
      // .column スタイルで四角い枠のボックスとして表示される（span / p どちらに付いても効く）。
      span: ['class'],
      p: ['class'],
      code: ['class'],
      pre: ['class'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    // http / https / mailto / tel 以外のスキーム（javascript: など）は除去する
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      /**
       * リッチエディタの見出しを 1 段ずつ下げる。
       * ページ内の h1 は記事タイトルの 1 つだけにしたいため、本文の「見出し1」(h1) は h2 に、
       * 「見出し2」(h2) は h3 に…と繰り下げる。これで筆者が付けた見出しの上下関係がそのまま保たれ、
       * 目次（h2 / h3）にも正しい階層で載る。
       * ※ 各変換は元タグ基準で一度だけ適用され、変換後のタグが再変換されることはない。
       */
      h1: 'h2',
      h2: 'h3',
      h3: 'h4',
      h4: 'h5',
      h5: 'h6',
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}),
        },
      }),
      // 本文中の画像は next/image を通さないため、
      // ・microCMS の画像は URL に fm=webp を付けて WebP 配信にする
      // ・遅延読み込み（loading="lazy"）にする
      img: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.src ? { src: toWebpIfMicroCMS(attribs.src) } : {}),
          loading: 'lazy',
        },
      }),
    },
  });
}
