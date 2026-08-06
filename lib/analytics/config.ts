/**
 * 計測基盤の設定値（環境変数の読み出し口）。
 *
 * ここ以外で process.env.NEXT_PUBLIC_GTM_ID などを直接参照しないこと。
 * ※ NEXT_PUBLIC_ が付く値はブラウザに埋め込まれる公開値。
 *   GTM のコンテナ ID と GA4 の測定 ID は、いずれも HTML に出る前提の公開値なので問題ない。
 *   秘匿値（API キー等）をここに置いてはいけない。
 */

/** GTM コンテナ ID（例: GTM-XXXXXXX）。未設定なら計測タグを一切読み込まない。 */
export const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? '';

/**
 * GA4 の測定 ID（例: G-XXXXXXXXXX）。
 * GA4 タグはコード側では発火させず、この値を dataLayer に載せて GTM 側の
 * 「Google タグ」の測定 ID として参照する（docs/analytics.md 参照）。
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? '';

/**
 * デバッグモード。
 * true にすると (1) 開発環境でも GTM を読み込み、(2) 送信内容を console に出力する。
 * 本番では設定しないこと。
 */
export const IS_ANALYTICS_DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';

/**
 * GTM を読み込むかどうか。
 * 既定では本番ビルドのみ。開発時（npm run dev）の操作が計測データに混ざるのを防ぐ。
 * GTM プレビューを開発環境で試したい場合は NEXT_PUBLIC_ANALYTICS_DEBUG=true を設定する。
 */
export const IS_GTM_ENABLED =
  GTM_CONTAINER_ID.length > 0 && (process.env.NODE_ENV === 'production' || IS_ANALYTICS_DEBUG);
