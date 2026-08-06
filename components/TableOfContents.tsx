import { analyticsAttributes } from '@/lib/analytics/attributes';
import type { TocItem } from '@/types/blog';

/**
 * 記事本文の目次。
 *
 * 開閉は <details>/<summary> のブラウザ標準機能で行うため Client Component にしていない
 * （JavaScript を増やさず、キーボード操作・スクリーンリーダー対応も標準で得られる）。
 * 既定は開いた状態で、閉じると見出しの一覧が畳まれる。
 * リンク先は lib/richText.ts が本文の見出しに振った id。
 *
 * 計測：目次項目のクリックだけを toc_click として送る（data 属性による自動計測）。
 * 開閉（summary）のクリックは計測対象外。記事情報（article_id / article_slug など）は
 * 記事ページのコンテキストから自動で付くため、ここでは指定しない。
 */
export default function TableOfContents({ items }: { items: readonly TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <details
      open
      className="group mb-10 rounded-2xl border border-brand-line bg-brand-surface shadow-panel"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-6 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent [&::-webkit-details-marker]:hidden">
        <span className="font-display text-lg font-bold tracking-jp text-brand-navy">目次</span>
        <span className="flex items-center gap-2 text-xs text-brand-accent">
          {/* 開いているときは「閉じる」、閉じているときは「開く」を表示する */}
          <span className="group-open:hidden">開く</span>
          <span className="hidden group-open:inline">閉じる</span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
          >
            <polyline
              points="5,8 10,13 15,8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>

      <nav aria-label="目次" className="border-t border-brand-line px-6 py-5">
        <ol className="space-y-1">
          {items.map((item) => {
            const isSub = item.level === 3;
            return (
              <li
                key={item.id}
                // H3 は左に余白＋ガイド線を入れて、H2 の下位であることを見た目で示す
                className={isSub ? 'ml-3 border-l border-brand-line pl-4 sm:ml-4 sm:pl-5' : ''}
              >
                <a
                  href={`#${item.id}`}
                  {...analyticsAttributes('toc_click', {
                    toc_text: item.text,
                    toc_anchor: `#${item.id}`,
                    toc_level: item.level,
                  })}
                  className={`flex items-start gap-2 rounded-md px-2 py-2 transition-colors hover:bg-brand-bg hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
                    isSub
                      ? 'text-[13px] leading-relaxed text-brand-muted'
                      : 'text-sm font-medium leading-relaxed text-brand-navy'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={
                      isSub
                        ? 'mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-accentsoft'
                        : 'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent'
                    }
                  />
                  <span>{item.text}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </details>
  );
}
