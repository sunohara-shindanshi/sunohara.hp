/**
 * microCMS のリッチエディタ本文を表示する。
 *
 * ⚠ 渡す HTML は、必ず lib/richText.ts の prepareArticleBody（内部で sanitizeRichText を実行）を
 *   通したサニタイズ済みのものにすること。ここでは再サニタイズしない。
 *   サニタイズは 1 箇所（prepareArticleBody）に集約している。ここで二重に sanitize すると、
 *   見出しの段下げ（h1→h2, h2→h3 …）が二重適用されて階層が崩れるため。
 * このコンポーネントと components/JsonLd.tsx 以外で dangerouslySetInnerHTML を使わないこと。
 */
export default function RichText({ sanitizedHtml }: { sanitizedHtml: string }) {
  return (
    <div
      // prose-headings:scroll-mt-28 は、目次から見出しへ飛んだときに
      // 固定ヘッダーの下に見出しが隠れないようにするための余白。
      className="prose prose-brand max-w-none prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:tracking-jp prose-a:text-brand-accent prose-img:rounded-2xl"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
