import BrandMotif from '@/components/BrandMotif';
import Container from '@/components/Container';
import CtaSection from '@/components/CtaSection';
import PageHeader from '@/components/PageHeader';
import ServiceCard from '@/components/ServiceCard';
import { buildPageMetadata } from '@/lib/metadata';
import { SERVICES } from '@/lib/services';

export const metadata = buildPageMetadata({
  title: '事業内容',
  description:
    '財務・資金（お金の悩み）、組織・人事（人の悩み）、営業・売上（売上の悩み）、IT・システム（仕組みの悩み）の4領域から、中小企業の経営課題を横断的に支援します。',
  path: '/services',
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        label="Services"
        title="事業内容"
        description="お金・人・売上・仕組み。4つの領域から、現場の状況に合わせて必要な支援を組み合わせてご提供します。単発のご相談から実行支援まで対応します。"
        cta={{ label: 'この内容で相談する', href: '/contact' }}
      />

      {/* 4領域の概要（トップページと同じ ServiceCard を使用） */}
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </Container>
      </section>

      {/* 各領域の詳細 */}
      <section className="border-t border-brand-line bg-brand-surface py-14 sm:py-20">
        <Container>
          <div className="space-y-14 sm:space-y-20">
            {SERVICES.map((service, index) => (
              <article key={service.id} id={service.id} className="scroll-mt-24">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                  <div>
                    <p className="font-display text-sm text-brand-accent">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-bold tracking-jp text-brand-navy sm:text-3xl">
                      {service.title}
                    </h2>
                    <p className="mt-1 text-sm text-brand-muted">（{service.subtitle}）</p>
                    <BrandMotif variant="rule" className="mt-4 h-3 w-24 text-brand-accent" />
                    <p className="mt-5 text-sm leading-relaxed text-brand-muted">
                      {service.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm leading-loose text-brand-ink sm:text-base">
                      {service.detail}
                    </p>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {service.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 rounded-md border border-brand-line bg-brand-bg px-4 py-3 text-sm text-brand-navy"
                        >
                          <BrandMotif
                            variant="mark"
                            className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 進め方 */}
      <section className="py-14 sm:py-20">
        <Container>
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-8 shadow-panel sm:p-12">
            <h2 className="font-display text-2xl font-bold tracking-jp text-brand-navy">
              ご相談から支援開始までの流れ
            </h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-4">
              {[
                { step: 'お問い合わせ', body: 'お問い合わせフォームからご連絡ください。' },
                { step: 'ヒアリング', body: '現状と、いちばん困っていることを伺います。' },
                { step: '現場確認・ご提案', body: '実際の現場を拝見し、支援範囲と進め方をご提案します。' },
                { step: '支援開始', body: 'ご契約後、決めた進め方に沿って併走します。' },
              ].map((item, index) => (
                <li key={item.step} className="border-t border-brand-accentsoft pt-5">
                  <p className="font-display text-sm text-brand-accent">
                    Step {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 font-display text-base font-bold tracking-jp text-brand-navy">
                    {item.step}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink">{item.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm leading-relaxed text-brand-muted">
              ※ 支援内容・期間によって費用は異なります。ご相談時にお見積りをご提示します。
            </p>
          </div>
        </Container>
      </section>

      {/* コンテンツを読み終えた後の CTA */}
      <CtaSection
        heading="自社に必要な支援が分からない、から始めてOKです"
        lead="4つの領域のどれに当てはまるか判断がつかなくても構いません。現状を伺い、優先順位から一緒に整理します。"
        buttonLabel="支援について相談する"
      />
    </>
  );
}
