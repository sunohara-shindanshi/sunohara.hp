import Script from 'next/script';

/**
 * Google Analytics（GA4 / gtag.js）を読み込む。
 *
 * - 測定 ID は `NEXT_PUBLIC_GA_ID` があればそれを使い、無ければ既定値を使う。
 *   （GA の測定 ID はブラウザに出る前提の公開値なので NEXT_PUBLIC_ で問題ない。秘匿情報ではない。）
 * - 本番ビルド（production）でのみ読み込む。開発時（npm run dev）は計測データを汚さないよう読み込まない。
 * - GA4 の「拡張計測（ブラウザ履歴イベントに基づくページ変更）」が有効なら、
 *   Next.js のクライアント遷移でもページビューが自動計測される（既定で有効）。
 * - next/script の afterInteractive で、ページの操作可能化を妨げないように読み込む。
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-VY959R184H';

export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production' || !GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
