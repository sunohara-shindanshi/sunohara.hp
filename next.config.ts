import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // URL の末尾スラッシュは「付けない」で統一する。
  // lib/siteConfig.ts の NAV_ITEMS / app/sitemap.ts のパス表記もこの設定に合わせている。
  trailingSlash: false,
  // レスポンスヘッダーの X-Powered-By は不要なので出さない
  poweredByHeader: false,
  images: {
    // next/image で表示する画像は、元が JPEG / PNG でも WebP に変換して配信する。
    // （ローカル画像・microCMS のサムネイル画像など next/image 経由のものすべてが対象）
    formats: ['image/webp'],
    // microCMS の画像は URL が変わらない限り内容も変わらないため、最適化結果を長めにキャッシュする
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        // microCMS の画像配信ドメイン。
        // ※要確認：microCMS の管理画面で発行される画像 URL のホスト名を確認し、
        //   異なる場合はここを実際のホスト名に修正すること（2026年時点の標準は images.microcms-assets.io）。
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
