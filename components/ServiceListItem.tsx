import Link from 'next/link';

import type { Service } from '@/lib/services';

/**
 * 事業内容の一覧項目（旧 ServiceCard）。
 *
 * 以前は白背景・角丸・影付きの「カード」だったが、囲みを増やすほど
 * テンプレートで量産した印象（角丸カードの多用）が強くなるという指摘を受け、
 * 枠や背景を持たないプレーンなテキストブロックに変更した。
 * トップページと事業内容ページで同じコンポーネントを使う（ページごとにマークアップを複製しない）。
 */
export default function ServiceListItem({ service, index }: { service: Service; index: number }) {
  return (
    // 枠・背景の代わりに、上端の細い罫線だけで項目を区切る
    // （components/PageHeader.tsx 隣接の「支援の進め方」セクションと同じ区切り方）
    <article className="border-t border-brand-accentsoft pt-6">
      <h3 className="font-display text-lg font-bold tracking-jp text-brand-navy sm:text-xl">
        <span className="text-brand-accent">{index + 1}.</span> {service.title}
        <span className="ml-1 text-xs font-normal text-brand-muted">（{service.subtitle}）</span>
      </h3>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-brand-ink">
        {service.points.map((point) => (
          <li key={point} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-brand-accent" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/services#${service.id}`}
        className="mt-4 inline-flex items-center gap-1 rounded text-sm font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      >
        詳しく見る
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
