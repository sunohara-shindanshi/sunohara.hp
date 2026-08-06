'use client';

// モバイルメニューの開閉状態（useState）と現在地の判定（usePathname）を使うため Client Component。

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import BrandMotif from '@/components/BrandMotif';
import Container from '@/components/Container';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_LOCATIONS, CTA_NAMES } from '@/lib/analytics/ctaNames';
import { NAV_ITEMS, siteConfig, telHref } from '@/lib/siteConfig';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ページ遷移のきっかけとなる操作（リンククリック）でメニューを閉じる。
  // 副作用（useEffect）で state を更新すると余分な再レンダリングが起きるため使わない。
  const closeMenu = () => setIsMenuOpen(false);

  const isCurrent = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line bg-brand-surface/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-3 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
          >
            <BrandMotif variant="mark" className="h-9 w-9 shrink-0 text-brand-accent" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-jp text-brand-navy sm:text-lg">
                {siteConfig.name}
              </span>
              <span className="text-[11px] tracking-[0.2em] text-brand-accent sm:text-xs">
                {siteConfig.catchphrase}
              </span>
            </span>
          </Link>

          {/* PC ナビゲーション */}
          <nav aria-label="メインナビゲーション" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href) ? 'page' : undefined}
                    className={`rounded text-sm tracking-jp transition-colors hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent ${
                      isCurrent(item.href)
                        ? 'font-semibold text-brand-accent'
                        : 'text-brand-navy'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* 電話（オフライン導線）は補助テキスト、CTA は sun 色ボタンで明確に区別する */}
              <li>
                <a
                  href={telHref}
                  {...analyticsAttributes('cta_click', {
                    cta_name: CTA_NAMES.HEADER_TEL,
                    cta_location: CTA_LOCATIONS.HEADER,
                    link_url: telHref,
                  })}
                  className="rounded text-sm font-medium text-brand-navy transition-colors hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
                >
                  {siteConfig.tel}
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  {...analyticsAttributes('cta_click', {
                    cta_name: CTA_NAMES.HEADER_CONTACT,
                    cta_location: CTA_LOCATIONS.HEADER,
                    link_url: '/contact',
                  })}
                  className="rounded-full bg-brand-sun px-5 py-2.5 text-sm font-bold text-brand-navy shadow-panel transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                >
                  相談する
                </Link>
              </li>
            </ul>
          </nav>

          {/* モバイル：メニュー開閉ボタン（アイコンのみ。文言は入れずレイアウト崩れを防ぐ） */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-line text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent lg:hidden"
          >
            {isMenuOpen ? (
              // × アイコン
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // ハンバーガーアイコン
              <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
                <span className="h-0.5 w-full rounded bg-brand-navy" />
                <span className="h-0.5 w-full rounded bg-brand-navy" />
                <span className="h-0.5 w-full rounded bg-brand-navy" />
              </span>
            )}
          </button>
        </div>
      </Container>

      {/* モバイルナビゲーション */}
      <nav
        id="mobile-navigation"
        aria-label="モバイルナビゲーション"
        hidden={!isMenuOpen}
        className="border-t border-brand-line bg-brand-surface lg:hidden"
      >
        <Container>
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                  className={`block rounded px-1 py-3 text-sm tracking-jp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
                    isCurrent(item.href) ? 'font-semibold text-brand-accent' : 'text-brand-navy'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 py-1">
              {/* CTA（sun 色）を主役に、電話は下に補助リンクとして置く */}
              <Link
                href="/contact"
                onClick={closeMenu}
                {...analyticsAttributes('cta_click', {
                  cta_name: CTA_NAMES.HEADER_MOBILE_CONTACT,
                  cta_location: CTA_LOCATIONS.HEADER,
                  link_url: '/contact',
                })}
                className="block rounded-full bg-brand-sun px-4 py-3 text-center text-sm font-bold text-brand-navy shadow-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                相談する
              </Link>
              <a
                href={telHref}
                onClick={closeMenu}
                {...analyticsAttributes('cta_click', {
                  cta_name: CTA_NAMES.HEADER_TEL,
                  cta_location: CTA_LOCATIONS.HEADER,
                  link_url: telHref,
                })}
                className="mt-2 block rounded px-1 py-2 text-center text-sm font-medium text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
              >
                お電話：{siteConfig.tel}
              </a>
            </li>
          </ul>
        </Container>
      </nav>
    </header>
  );
}
