import BrandMotif from '@/components/BrandMotif';
import Container from '@/components/Container';
import PrimaryCta from '@/components/PrimaryCta';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_LOCATIONS, CTA_NAMES } from '@/lib/analytics/ctaNames';
import { siteConfig, telHref } from '@/lib/siteConfig';

/** 下層ページ共通の見出し帯。ページごとに構造を分岐させない。 */
export default function PageHeader({
  label,
  title,
  description,
  cta,
}: {
  /** 英字ラベル */
  label: string;
  title: string;
  description: string;
  /**
   * ファーストビューの CTA ボタン。ページ内容に合わせたラベルを渡す。
   * 省略した場合はボタンを出さない（例：お問い合わせページ自身）。
   */
  cta?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden bg-sky text-brand-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-sun/45 blur-3xl"
      />
      <BrandMotif
        variant="hero"
        className="pointer-events-none absolute inset-0 h-full w-full text-brand-accent opacity-15"
      />
      <Container className="relative py-14 sm:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-accent">{label}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-jp text-brand-navy sm:text-4xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-brand-ink sm:text-base">
          {description}
        </p>

        {/* ファーストビューの CTA（主要ボタン + 電話番号）。
            CTA も電話番号も無いページでは、余白だけの行が残らないよう行ごと出さない。 */}
        {cta || telHref ? (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            {cta ? (
              <PrimaryCta
                href={cta.href}
                ctaName={CTA_NAMES.PAGE_HEADER_CONTACT}
                ctaLocation={CTA_LOCATIONS.PAGE_HEADER}
              >
                {cta.label}
              </PrimaryCta>
            ) : null}
            {telHref ? (
              <a
                href={telHref}
                {...analyticsAttributes('cta_click', {
                  cta_name: CTA_NAMES.PAGE_HEADER_TEL,
                  cta_location: CTA_LOCATIONS.PAGE_HEADER,
                  link_url: telHref,
                })}
                className="rounded text-sm text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                お電話：
                <span className="font-bold underline underline-offset-4">{siteConfig.tel}</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
