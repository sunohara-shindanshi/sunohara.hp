'use client';

import { useEffect } from 'react';

import {
  ANALYTICS_ELEMENT_SELECTOR,
  readAnalyticsAttributes,
} from '@/lib/analytics/attributes';
import { ANALYTICS_EVENTS, type AnalyticsEventName, type TrackEvent } from '@/lib/analytics/events';

/**
 * クリック計測（イベント委譲）。
 *
 * document に 1 つだけリスナーを置き、クリックされた要素をさかのぼって判定する。
 * この方式にしている理由：
 *  1. リンクやボタンが増えても、計測用の onClick を各コンポーネントに書かなくてよい
 *     （data-analytics-* 属性を付けるだけ、または何も付けなくても自動判定される）。
 *  2. microCMS のリッチエディタ本文（HTML）内のリンクも計測できる。
 *     本文は React コンポーネントでは包めないため、委譲以外に手段がない。
 *
 * 判定の優先順位：
 *   1. data-analytics-event が付いた要素（明示指定）
 *   2. <a> の href から自動判定（外部リンク / PDF / メール / 電話）
 */

/** PDF とみなす URL かどうか */
function isPdfUrl(url: URL): boolean {
  return /\.pdf$/i.test(url.pathname);
}

/** リンクの表示テキスト（無い場合は代替テキスト）を取り出す */
function getLinkText(anchor: HTMLAnchorElement): string {
  const text =
    anchor.textContent?.replace(/\s+/g, ' ').trim() ||
    anchor.getAttribute('aria-label')?.trim() ||
    anchor.querySelector('img')?.getAttribute('alt')?.trim() ||
    anchor.getAttribute('title')?.trim() ||
    '';
  // GA4 のパラメータ値の上限（100 バイト）を超えないよう切り詰める
  return text.slice(0, 100);
}

/** URL の末尾のファイル名を取り出す */
function getFileName(url: URL): string {
  const lastSegment = url.pathname.split('/').pop() ?? '';
  try {
    return decodeURIComponent(lastSegment);
  } catch {
    return lastSegment;
  }
}

export function useLinkTracking(trackEvent: TrackEvent): void {
  useEffect(() => {
    /**
     * data 属性から読み取ったイベントは、実行時まで型が確定しない。
     * イベント名は readAnalyticsAttributes が定義済みのものだけに限定しているため、
     * ここでのみ緩い型として扱う。
     */
    const trackLoose = trackEvent as (
      event: AnalyticsEventName,
      params: Record<string, unknown>,
    ) => void;

    const handleClick = (event: MouseEvent) => {
      // 修飾キー付きクリック（別タブで開く等）も遷移意図として計測する。
      // 右クリック・中クリックは click イベントでは発火しないため対象外。
      const target = event.target;
      if (!(target instanceof Element)) return;

      // 1. 明示指定（data-analytics-event）
      const declaredElement = target.closest(ANALYTICS_ELEMENT_SELECTOR);
      if (declaredElement) {
        const parsed = readAnalyticsAttributes(declaredElement);
        if (parsed) {
          trackLoose(parsed.event, parsed.params);
          return;
        }
      }

      // 2. <a href> の自動判定
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const rawHref = anchor.getAttribute('href') ?? '';
      // ページ内アンカー（目次など）は遷移ではないため計測しない
      if (!rawHref || rawHref.startsWith('#')) return;

      if (rawHref.startsWith('mailto:')) {
        trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { cta_name: 'email', link_url: rawHref });
        return;
      }
      if (rawHref.startsWith('tel:')) {
        trackEvent(ANALYTICS_EVENTS.CTA_CLICK, { cta_name: 'tel', link_url: rawHref });
        return;
      }

      let url: URL;
      try {
        // anchor.href はブラウザが解決した絶対 URL
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

      if (isPdfUrl(url)) {
        trackEvent(ANALYTICS_EVENTS.PDF_DOWNLOAD, {
          file_name: getFileName(url),
          file_url: url.href,
        });
        return;
      }

      if (url.host !== window.location.host) {
        trackEvent(ANALYTICS_EVENTS.EXTERNAL_LINK_CLICK, {
          link_url: url.href,
          link_text: getLinkText(anchor),
        });
      }
      // 内部リンクは page_view で追えるため、ここでは送信しない
      // （記事一覧・関連記事などの「どこから来たか」は data 属性側で個別に計測している）
    };

    // capture 段階で受ける。途中で stopPropagation されても取りこぼさないため。
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [trackEvent]);
}
