/**
 * 「この記事でわかること」欄。
 * 箇条書きの各点をチェックマークで表示する。項目が 0 件なら何も表示しない。
 * ※ 値は microCMS 由来のプレーンテキスト。JSX の中括弧展開で描画する（HTML は挿入しない）。
 */
export default function ArticleKeyPoints({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="この記事でわかること"
      className="mb-8 rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-panel sm:p-7"
    >
      <h2 className="font-display text-base font-bold tracking-jp text-brand-navy sm:text-lg">
        この記事でわかること
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-brand-ink">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent text-white"
            >
              <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
                <path
                  d="M4 10.5l4 4 8-9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
