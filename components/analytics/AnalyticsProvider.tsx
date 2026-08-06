'use client';

import { Suspense, useCallback, useMemo, useRef, type ReactNode } from 'react';

import {
  AnalyticsContext,
  type AnalyticsContextValue,
} from '@/components/analytics/context';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { useLinkTracking } from '@/components/analytics/useLinkTracking';
import { useScrollTracking } from '@/components/analytics/useScrollTracking';
import { pushToDataLayer } from '@/lib/analytics/dataLayer';
import {
  ARTICLE_PARAM_KEYS,
  type AnalyticsEventName,
  type ArticleEventParams,
  type CommonEventParams,
  type TrackEvent,
} from '@/lib/analytics/events';

/**
 * 計測基盤のルート。app/layout.tsx でページ全体を包む。
 *
 * 役割：
 *  - trackEvent の提供（→ dataLayer.push → GTM → GA4）
 *  - 共通パラメータ（page_path / page_location / page_title）の自動付与
 *  - 記事コンテキスト（article_id など）の保持と自動付与
 *  - ページビュー / スクロール率 / クリックの自動計測
 *
 * 記事コンテキストは state ではなく ref で持つ。
 * 登録のたびに再レンダリングが起きると、配下のページ全体が描画し直されるため。
 */

/** dataLayer の値はページをまたいで保持されるため、記事ページ以外では明示的に打ち消す */
const CLEARED_ARTICLE_PARAMS: ArticleEventParams = Object.fromEntries(
  ARTICLE_PARAM_KEYS.map((key) => [key, undefined]),
) as ArticleEventParams;

/** 送信時点の閲覧情報を集める */
function readCommonParams(): CommonEventParams {
  return {
    page_path: `${window.location.pathname}${window.location.search}`,
    page_location: window.location.href,
    page_title: document.title,
  };
}

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pageContextRef = useRef<ArticleEventParams>({});

  const trackEvent = useCallback<TrackEvent>((event, params) => {
    if (typeof window === 'undefined') return;

    pushToDataLayer({
      event: event satisfies AnalyticsEventName,
      ...readCommonParams(),
      // 記事ページ以外では記事パラメータを空にしてから、現在のページの値を載せる
      ...CLEARED_ARTICLE_PARAMS,
      ...pageContextRef.current,
      // 個別イベントの指定を最優先にする（一覧クリックのように記事情報を上書きする場合がある）
      ...params,
    });
  }, []);

  const setPageContext = useCallback<AnalyticsContextValue['setPageContext']>((params) => {
    pageContextRef.current = params;
    return () => {
      // 別のページのコンテキストに置き換わっている場合は消さない
      if (pageContextRef.current === params) pageContextRef.current = {};
    };
  }, []);

  const value = useMemo<AnalyticsContextValue>(
    () => ({ trackEvent, setPageContext }),
    [trackEvent, setPageContext],
  );

  useScrollTracking(trackEvent);
  useLinkTracking(trackEvent);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {/*
        PageViewTracker は children より後に置く。
        React は子の効果を先に実行するため、記事ページのコンテキスト登録
        （ArticleAnalytics）が page_view の送信前に完了する。
      */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </AnalyticsContext.Provider>
  );
}
