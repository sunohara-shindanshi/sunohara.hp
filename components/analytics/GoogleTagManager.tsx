import Script from 'next/script';

import { GA_MEASUREMENT_ID, GTM_CONTAINER_ID, IS_GTM_ENABLED } from '@/lib/analytics/config';

/**
 * Google Tag Manager のコンテナを読み込む。
 *
 * - GA4 のタグはここでは読み込まない。GTM の管理画面側で「Google タグ（GA4）」を設定し、
 *   測定 ID には dataLayer に載せた ga_measurement_id を参照させる（docs/analytics.md 参照）。
 *   こうすることで、GA4 の測定 ID もコードに直書きせず環境変数で管理できる。
 * - コンテナ ID が未設定、または本番ビルド以外では何も読み込まない
 *   （開発時の操作が計測データに混ざらないようにするため）。
 * - afterInteractive で読み込み、ページの操作可能化（TBT）を妨げない。
 */
export default function GoogleTagManager() {
  if (!IS_GTM_ENABLED) return null;

  // dataLayer の初期化と GA4 測定 ID の受け渡しを、GTM 本体の読み込み前に済ませる。
  const bootstrapScript = `window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ ga_measurement_id: ${JSON.stringify(GA_MEASUREMENT_ID)} });
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(GTM_CONTAINER_ID)});`;

  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {bootstrapScript}
    </Script>
  );
}

/**
 * JavaScript が無効な環境向けのフォールバック（<body> 直後に置く）。
 * GTM の標準スニペットに含まれるもので、これが無いと JS 無効時にページビューが記録されない。
 */
export function GoogleTagManagerNoScript() {
  if (!IS_GTM_ENABLED) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(GTM_CONTAINER_ID)}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
