import Link from 'next/link';
import type { ReactNode } from 'react';

import { analyticsAttributes } from '@/lib/analytics/attributes';
import type { CtaLocation, CtaName } from '@/lib/analytics/ctaNames';

/**
 * サイト内で「唯一の主要 CTA（コンバージョン導線）」のボタン。
 *
 * 他のボタン（濃紺の塗り・青枠のアウトライン）とは明確に区別するため、
 * ブランドの差し色（sun＝陽だまりの黄）だけを CTA 専用色として使う。
 * この色は CTA 以外のボタンには使わないこと。
 * 黄 × 濃紺文字のコントラストは 5.56:1（WCAG AA 適合）。
 *
 * クリックは cta_click として自動計測される
 * （data 属性 → AnalyticsProvider のイベント委譲。個別の onClick は不要）。
 * 設置場所ごとの識別子は lib/analytics/ctaNames.ts にまとめている。
 */
export default function PrimaryCta({
  href,
  children,
  className = '',
  ctaName,
  ctaLocation,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** 計測上の識別子（GA4 の cta_name） */
  ctaName: CtaName;
  /** 計測上の設置場所（GA4 の cta_location） */
  ctaLocation?: CtaLocation;
}) {
  return (
    <Link
      href={href}
      {...analyticsAttributes('cta_click', {
        cta_name: ctaName,
        cta_location: ctaLocation,
        link_url: href,
      })}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-brand-sun px-8 py-4 text-sm font-bold text-brand-navy shadow-panel transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${className}`}
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
