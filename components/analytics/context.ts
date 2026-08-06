'use client';

import { createContext, useContext, useEffect } from 'react';

import type { ArticleEventParams, TrackEvent } from '@/lib/analytics/events';

/**
 * 計測の共有コンテキスト。
 *
 * 各コンポーネントは useAnalytics().trackEvent() だけを使う。
 * dataLayer や GA4 の存在をコンポーネント側が意識しなくて済むようにするための境界。
 */

export type AnalyticsContextValue = {
  /** イベントを送信する（共通パラメータ・記事コンテキストは自動付与される） */
  trackEvent: TrackEvent;
  /**
   * 現在のページのコンテキスト（記事情報）を登録する。
   * 戻り値は解除用の関数。
   */
  setPageContext: (params: ArticleEventParams) => () => void;
};

/** Provider の外で呼ばれた場合に使う何もしない実装（描画は壊さない） */
const noopContext: AnalyticsContextValue = {
  trackEvent: () => {},
  setPageContext: () => () => {},
};

export const AnalyticsContext = createContext<AnalyticsContextValue>(noopContext);

/**
 * イベント送信用のフック。
 * ```tsx
 * const { trackEvent } = useAnalytics();
 * trackEvent('form_submit', { form_name: 'contact' });
 * ```
 */
export function useAnalytics(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}

/**
 * このページのイベントに常に付与するコンテキスト（記事情報）を登録する。
 *
 * ページ側（子）の効果は Provider（親）の page_view 送信より先に実行されるため、
 * page_view にも記事情報が含まれる。
 */
export function useAnalyticsPageContext(params: ArticleEventParams): void {
  const { setPageContext } = useAnalytics();
  // オブジェクトは毎レンダリング新しくなるため、内容が同じなら再登録しないよう文字列で比較する
  const serialized = JSON.stringify(params);

  useEffect(() => {
    return setPageContext(JSON.parse(serialized) as ArticleEventParams);
  }, [serialized, setPageContext]);
}
