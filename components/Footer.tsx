import Link from 'next/link';

import BrandMotif from '@/components/BrandMotif';
import Container from '@/components/Container';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_LOCATIONS, CTA_NAMES } from '@/lib/analytics/ctaNames';
import { SERVICES } from '@/lib/services';
import { NAV_ITEMS, siteConfig, telHref } from '@/lib/siteConfig';

/** 全ページ共通フッター（app/layout.tsx から読み込む）。 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-line bg-brand-navy text-white">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <BrandMotif variant="mark" className="h-9 w-9 shrink-0 text-brand-accentsoft" />
              <div className="leading-tight">
                <p className="font-display text-base font-bold tracking-jp">{siteConfig.name}</p>
                <p className="text-xs tracking-[0.2em] text-brand-accentsoft">
                  {siteConfig.catchphrase}
                </p>
              </div>
            </div>
            <address className="mt-6 space-y-2 text-sm not-italic leading-relaxed text-brand-accentsoft">
              <p>{siteConfig.address.full}</p>
              {/* 電話番号は非掲載のときは行ごと出さない（siteConfig.tel が null の間） */}
              {telHref ? (
                <p>
                  TEL:{' '}
                  <a
                    href={telHref}
                    {...analyticsAttributes('cta_click', {
                      cta_name: CTA_NAMES.FOOTER_TEL,
                      cta_location: CTA_LOCATIONS.FOOTER,
                      link_url: telHref,
                    })}
                    className="rounded underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accentsoft"
                  >
                    {siteConfig.tel}
                  </a>
                </p>
              ) : (
                <p>お問い合わせはフォームから承っています。</p>
              )}
            </address>
          </div>

          <nav aria-label="フッターナビゲーション">
            <p className="font-display text-sm font-bold tracking-jp">サイトマップ</p>
            <ul className="mt-4 space-y-3 text-sm text-brand-accentsoft">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accentsoft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-display text-sm font-bold tracking-jp">事業内容</p>
            <ul className="mt-4 space-y-3 text-sm text-brand-accentsoft">
              {SERVICES.map((service) => (
                <li key={service.id}>{service.title}</li>
              ))}
            </ul>
            <Link
              href="/contact"
              {...analyticsAttributes('cta_click', {
                cta_name: CTA_NAMES.FOOTER_CONTACT,
                cta_location: CTA_LOCATIONS.FOOTER,
                link_url: '/contact',
              })}
              className="mt-6 inline-flex rounded-full bg-brand-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accentsoft"
            >
              お問い合わせはこちら
            </Link>
          </div>
        </div>

        <p className="mt-12 border-t border-white/15 pt-6 text-xs text-brand-accentsoft">
          © {currentYear} {siteConfig.name}
        </p>
      </Container>
    </footer>
  );
}
