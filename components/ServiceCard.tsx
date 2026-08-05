import BrandMotif from '@/components/BrandMotif';
import type { Service } from '@/lib/services';

/**
 * 事業内容カード。トップページと事業内容ページで同じコンポーネントを使う
 * （ページごとにマークアップを複製しない）。
 */
export default function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-panel sm:p-7">
      <div className="flex items-center gap-3">
        <BrandMotif variant="mark" className="h-8 w-8 shrink-0 text-brand-accent" />
        <span className="font-display text-sm text-brand-muted">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-bold tracking-jp text-brand-navy">
        {service.title}
      </h3>
      <p className="mt-1 text-xs text-brand-muted">（{service.subtitle}）</p>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-brand-ink">
        {service.points.map((point) => (
          <li key={point} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-brand-accent" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
