import Container from '@/components/Container';
import PrimaryCta from '@/components/PrimaryCta';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_LOCATIONS, CTA_NAMES, type CtaName } from '@/lib/analytics/ctaNames';
import { siteConfig, telHref } from '@/lib/siteConfig';

/**
 * コンテンツを読み終えた後に置く CTA 帯。
 *
 * - 濃紺の面 + 中央揃えで視線を止める（ページ本文の白/淡青と切り替わり自然と目に入る）
 * - 見出し（リード文）→ CTA ボタン → 電話番号 → 補足の順で、行動へ誘導する
 * - ボタンは主要 CTA 1 つのみ（電話は補助）。ページごとに heading / lead / buttonLabel を変えて、
 *   コンテンツの文脈に合わせる。
 */
export default function CtaSection({
  heading,
  lead,
  buttonLabel,
  buttonHref = '/contact',
  ctaName = CTA_NAMES.SECTION_CONTACT,
}: {
  heading: string;
  lead: string;
  buttonLabel: string;
  buttonHref?: string;
  /**
   * 計測上の識別子。ページごとに固有の値を渡すと、
   * GA4 で「どのページの末尾 CTA が押されたか」を区別できる。
   */
  ctaName?: CtaName;
}) {
  const { online, durationNote } = siteConfig.consultation;
  // 事実として確認できている訴求のみを並べる（費用・締切などは記載しない）
  const notes = [online ? 'オンライン相談も承っています' : null, durationNote].filter(Boolean);

  return (
    <section className="bg-brand-navy text-white">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-jp sm:text-3xl">{heading}</h2>
          <p className="mt-4 text-sm leading-loose text-brand-accentsoft sm:text-base">{lead}</p>

          <div className="mt-8 flex justify-center">
            <PrimaryCta href={buttonHref} ctaName={ctaName} ctaLocation={CTA_LOCATIONS.SECTION}>
              {buttonLabel}
            </PrimaryCta>
          </div>

          <p className="mt-6 text-sm text-brand-accentsoft">
            お急ぎの方はお電話でも：
            <a
              href={telHref}
              {...analyticsAttributes('cta_click', {
                cta_name: CTA_NAMES.SECTION_TEL,
                cta_location: CTA_LOCATIONS.SECTION,
                link_url: telHref,
              })}
              className="ml-1 rounded font-bold text-white underline underline-offset-4 hover:text-brand-sun focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sun"
            >
              {siteConfig.tel}
            </a>
          </p>
          {notes.length > 0 ? (
            <p className="mt-2 text-xs text-brand-accentsoft/90">{notes.join(' / ')}</p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
