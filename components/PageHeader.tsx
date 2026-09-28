import Link from 'next/link';

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
  subtitle,
  description,
  cta,
  breadcrumbs,
}: {
  /**
   * パンくずリスト（任意）。第 3 階層のページ（例：事業内容 > 財務・資金）で渡す。
   * 最後の要素は現在のページとして href を省略する。
   */
  breadcrumbs?: { label: string; href?: string }[];
  /** 英字ラベル */
  label: string;
  title: string;
  /** 見出しの下に小さく添える補足（任意。例：（お金にまつわる悩み）） */
  subtitle?: string;
  description: string;
  /**
   * ファーストビューの CTA ボタン。ページ内容に合わせたラベルを渡す。
   * 省略した場合はボタンを出さない（例：お問い合わせページ自身）。
   */
  cta?: { label: string; href: string };
}) {
  return (
    // ぼかした円の装飾は置かない（全ページ共通のこのコンポーネントに付けると、
    // どのページを開いても同じ「AI が作るヒーロー」に見えてしまうため）。
    // ブランドモチーフの折れ線だけを、控えめな濃さで残す。
    <section className="relative overflow-hidden bg-sky text-brand-ink">
      <BrandMotif
        variant="hero"
        className="pointer-events-none absolute inset-0 h-full w-full text-brand-accent opacity-10"
      />
      <Container className="relative py-14 sm:py-20">
        {/* 記事詳細（app/blog/[id]/page.tsx）のパンくずと同じ見た目 */}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="パンくずリスト" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-brand-ink">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="rounded text-brand-navy underline underline-offset-4 hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-brand-navy">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-accent">{label}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-jp text-brand-navy sm:text-4xl">
          {title}
        </h1>
        {/* 水色のグラデーション上では muted だとコントラストが足りないため ink を使う */}
        {subtitle ? <p className="mt-2 text-sm text-brand-ink">{subtitle}</p> : null}
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
