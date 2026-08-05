import type { Metadata } from 'next';

import { SITE_URL, siteConfig } from '@/lib/siteConfig';

type PageMetadataInput = {
  /**
   * ページ固有のタイトル（屋号は app/layout.tsx の title.template で自動的に付与される）。
   * ※ トップページ（path: '/'）だけは例外で、この値は使わず「屋号｜キャッチフレーズ」を採用する。
   */
  title: string;
  /** ページ固有の説明文（ページごとに必ず異なる内容にする） */
  description: string;
  /** ルート（例: '/services'）。末尾スラッシュは付けない（next.config.ts の trailingSlash: false と統一） */
  path: string;
};

/**
 * 各ページの metadata を生成する。
 * canonical / OGP の URL は SITE_URL から組み立てるため、ドメイン変更時は siteConfig の
 * SITE_URL を書き換えるだけでよい。
 */
export function buildPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  // openGraph.title には title.template が適用されないため、ここで完全な形にする。
  const fullTitle = path === '/' ? `${siteConfig.name}｜${siteConfig.catchphrase}` : `${title}｜${siteConfig.name}`;

  return {
    // トップページだけは「屋号｜キャッチフレーズ」を完全な形で使う（title.template を適用しない）。
    title: path === '/' ? { absolute: fullTitle } : title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      url,
      siteName: siteConfig.name,
      locale: 'ja_JP',
    },
  };
}
