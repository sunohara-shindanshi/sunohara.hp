import { IS_ANALYTICS_DEBUG } from '@/lib/analytics/config';

/**
 * dataLayer への push を担う唯一の場所。
 *
 * ⚠ GA4（gtag）へ直接送信しないこと。計測はすべて
 *    trackEvent() → pushToDataLayer() → window.dataLayer.push() → GTM → GA4
 *    の経路に統一する。送信先の変更（GA4 以外の追加など）を GTM 側だけで完結させるため。
 */

/** dataLayer に積むオブジェクト。event キーを持つものが GTM の「カスタムイベント」になる。 */
export type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
  }
}

/**
 * dataLayer に 1 件 push する。
 * GTM が未読み込み（開発環境など）でも window.dataLayer は単なる配列として動くため、
 * 送信内容の確認だけなら開発環境でも可能。
 */
export function pushToDataLayer(payload: DataLayerObject): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);

  if (IS_ANALYTICS_DEBUG) {
    // 開発時の確認用。本番（NEXT_PUBLIC_ANALYTICS_DEBUG 未設定）では出力しない。
    console.debug('[analytics]', payload);
  }
}
