import Link from 'next/link';

import Container from '@/components/Container';
import ContactForm from '@/components/ContactForm';
import PageHeader from '@/components/PageHeader';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_NAMES } from '@/lib/analytics/ctaNames';
import { buildPageMetadata } from '@/lib/metadata';
import { siteConfig, telHref } from '@/lib/siteConfig';

export const metadata = buildPageMetadata({
  title: 'お問い合わせ',
  description: `${siteConfig.name}へのご相談はこちらから。財務・資金、組織・人事、営業・売上、IT・システムに関するお問い合わせを、フォームから承ります。ご相談内容が固まっていない段階でも構いません。`,
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        label="Contact"
        title="お問い合わせ"
        description="ご相談内容が固まっていない段階でも構いません。現在の状況をお聞かせいただければ、必要な支援をご提案します。"
      />

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-panel sm:p-10">
              <h2 className="font-display text-xl font-bold tracking-jp text-brand-navy">
                お問い合わせフォーム
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                「必須」の項目をご入力のうえ、送信してください。
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-panel sm:p-8">
              {/* 電話番号を掲載している場合のみ電話導線を出す。
                  非掲載のときは、フォーム利用時の案内に差し替える。 */}
              {telHref ? (
                <>
                  <h2 className="font-display text-lg font-bold tracking-jp text-brand-navy">
                    お電話でのご相談
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-brand-ink">
                    直接お話しされたい場合は、こちらへご連絡ください。
                  </p>
                  <a
                    href={telHref}
                    {...analyticsAttributes('cta_click', {
                      cta_name: CTA_NAMES.CONTACT_PAGE_TEL,
                      link_url: telHref,
                    })}
                    className="mt-4 inline-flex rounded font-display text-2xl font-bold tracking-jp text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                  >
                    {siteConfig.tel}
                  </a>
                </>
              ) : (
                <>
                  <h2 className="font-display text-lg font-bold tracking-jp text-brand-navy">
                    ご相談の受け付けについて
                  </h2>
                  {/* モバイルではフォームが上に縦積みになるため、「左の」など位置に依存する表現は使わない */}
                  <p className="mt-4 text-sm leading-relaxed text-brand-ink">
                    ご相談はお問い合わせフォームから承っています。
                    {siteConfig.consultation.online
                      ? 'お話を伺ったうえで、オンラインでの面談にも対応しています。'
                      : null}
                  </p>
                </>
              )}

              <dl className="mt-8 space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-brand-navy">事務所</dt>
                  <dd className="mt-1 text-brand-ink">{siteConfig.name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-brand-navy">所在地</dt>
                  <dd className="mt-1 leading-relaxed text-brand-ink">{siteConfig.address.full}</dd>
                </div>
              </dl>

              <p className="mt-8 text-sm leading-relaxed text-brand-muted">
                ご相談の対象となる支援内容は
                <Link
                  href="/services"
                  className="mx-1 rounded font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                >
                  事業内容
                </Link>
                ページをご覧ください。
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
