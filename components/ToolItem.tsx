import Link from 'next/link';

import RichText from '@/components/RichText';
import { buildBlogPostHref } from '@/lib/blogUrl';
import { formatJapaneseDate } from '@/lib/formatDate';
import type { Tool } from '@/types/tool';

/**
 * 便利ツール一覧の 1 行。
 *
 * - 行（ツール名・ひとこと説明）をクリックすると、その場で詳細（使い方など）が開く。
 *   開閉はブラウザ標準の <details> / <summary> を使う（JavaScript 不要・キーボード操作や読み上げにも標準で対応）。
 * - 公式サイトへのリンクは行の右端に常に出す（詳細を開かなくても飛べるように）。
 *   <summary> の中にリンクを入れるとクリックが開閉と競合するため、<details> の外に置いている。
 * - 詳細も記事リンクも無いツールは開閉させず、名前と説明だけを表示する。
 * - 角丸・影の囲みは付けず、上端の罫線だけで行を区切る（サイト全体の方針）。
 * 外部リンクのクリックは components/analytics/useLinkTracking.ts が自動で計測する（external_link_click）。
 */
export default function ToolItem({ tool, detailHtml }: { tool: Tool; detailHtml: string }) {
  const checkedDate = tool.checkedAt ? formatJapaneseDate(tool.checkedAt) : null;
  const hasDetail = Boolean(detailHtml || tool.article || checkedDate);

  const heading = (
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-display text-base font-bold tracking-jp text-brand-navy sm:text-lg">
          {tool.name}
        </span>
        {tool.pricing ? (
          <span className="border border-brand-accent px-2 py-0.5 text-xs font-medium text-brand-accent">
            {tool.pricing}
          </span>
        ) : null}
      </span>
      {tool.summary ? (
        <span className="mt-1 block text-sm leading-relaxed text-brand-ink">{tool.summary}</span>
      ) : null}
    </span>
  );

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-t border-brand-line py-5">
      {hasDetail ? (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-start gap-3 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent [&::-webkit-details-marker]:hidden">
            {/* 開閉の目印（閉じているときは右向き、開くと下向きに回転） */}
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-brand-accent transition-transform group-open:rotate-90"
            >
              <path
                d="M7 4l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {heading}
          </summary>

          <div className="mt-4 border-l-2 border-brand-accentsoft pl-5 sm:ml-8">
            {detailHtml ? <RichText sanitizedHtml={detailHtml} /> : null}
            {tool.article ? (
              <p className={detailHtml ? 'mt-5' : undefined}>
                <Link
                  href={buildBlogPostHref(tool.article.id)}
                  className="rounded text-sm font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                >
                  使い方の記事を読む：{tool.article.title}
                  <span aria-hidden="true"> →</span>
                </Link>
              </p>
            ) : null}
            {checkedDate ? (
              <p className="mt-4 text-xs text-brand-muted">情報の確認日：{checkedDate}</p>
            ) : null}
          </div>
        </details>
      ) : (
        // 開閉しない行も、開閉できる行と文字の位置をそろえる（矢印の幅ぶん字下げ）
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="h-5 w-5 shrink-0" />
          {heading}
        </div>
      )}

      {tool.url ? (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-flex shrink-0 items-center gap-1 self-start whitespace-nowrap rounded border border-brand-navy px-3 py-1.5 text-xs font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        >
          公式サイト
          <span aria-hidden="true">↗</span>
          <span className="sr-only">（{tool.name}、新しいタブで開く）</span>
        </a>
      ) : null}
    </li>
  );
}
