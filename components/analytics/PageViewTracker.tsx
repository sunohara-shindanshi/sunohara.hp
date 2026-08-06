'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useAnalytics } from '@/components/analytics/context';
import { resetScrollTracking } from '@/components/analytics/useScrollTracking';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

/**
 * ページビューの送信（App Router のクライアント遷移にも対応）。
 *
 * - 初回表示とクライアント遷移の両方でここから page_view を送る。
 *   GTM 側では「Google タグ」の自動ページビュー送信を必ず OFF にすること（二重送信の防止）。
 * - 送信済み URL をモジュールスコープで覚え、同じ URL では二度送らない。
 *   （React の再マウント・開発時の StrictMode による二重実行を防ぐ）
 * - useSearchParams を使うため、AnalyticsProvider 側で <Suspense> に包んでいる。
 *   これにより、このコンポーネント以外はサーバーで静的に描画されたままになる。
 * - loading.tsx があるルート（/blog）では、表示直後の document.title がまだ空のことがある。
 *   空のまま送ると GA4 のページタイトルが「(not set)」になるため、タイトルが入るのを
 *   最大 TITLE_WAIT_LIMIT_MS だけ待ってから送る。
 */

/** 直近で page_view を送った URL（pathname + search） */
let lastTrackedUrl: string | null = null;
/** 直前に表示していたページの URL（SPA 遷移時の参照元として送る） */
let previousPageLocation: string | null = null;

/** document.title の確認間隔（ミリ秒） */
const TITLE_POLL_INTERVAL_MS = 50;
/** タイトルを待つ上限（ミリ秒）。これを過ぎたらタイトルが空でも送信する。 */
const TITLE_WAIT_LIMIT_MS = 500;

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const query = searchParams.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedUrl === currentUrl) return;
    lastTrackedUrl = currentUrl;

    // ページが変わったのでスクロール率の送信済み記録を初期化する
    resetScrollTracking();

    // 初回表示は外部サイトからの参照元、クライアント遷移は直前のページを参照元とする
    const referrer = previousPageLocation ?? document.referrer;
    previousPageLocation = window.location.href;

    let hasSent = false;
    let timerId = 0;
    let waitedMs = 0;

    const send = () => {
      if (hasSent) return;
      hasSent = true;
      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page_referrer: referrer || undefined });
    };

    const sendWhenTitleReady = () => {
      if (document.title || waitedMs >= TITLE_WAIT_LIMIT_MS) {
        send();
        return;
      }
      waitedMs += TITLE_POLL_INTERVAL_MS;
      timerId = window.setTimeout(sendWhenTitleReady, TITLE_POLL_INTERVAL_MS);
    };
    sendWhenTitleReady();

    return () => {
      if (timerId !== 0) window.clearTimeout(timerId);
      // タイトル待ちの途中で離脱した場合も、ページビューを取りこぼさないよう送る。
      // ただし URL が既に次のページへ変わっているときは送らない
      // （送信時に読む window.location が次のページのものになり、誤った page_path になるため）。
      if (`${window.location.pathname}${window.location.search}` === currentUrl) send();
    };
  }, [pathname, searchParams, trackEvent]);

  return null;
}
