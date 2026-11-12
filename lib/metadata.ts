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
  /**
   * タイトルの末尾に「｜屋号」を付けるか（既定：付ける）。
   * ブログ記事では false にする。記事タイトルは長く、中に「｜」を含むものも多いため、
   * 屋号まで付けると Google が「｜」で区切られた一部分だけを検索結果のタイトルに選ぶことがある
   * （実例：「【最新版】…すべて公開！｜採用の具体的な手段を教えます（随時更新）｜屋号」が
   *  「採用の具体的な手段を教えます」と表示された）。屋号は検索結果にサイト名として別に表示される。
   */
  withSiteName?: boolean;
};

/**
 * 各ページの metadata を生成する。
 * canonical / OGP の URL は SITE_URL から組み立てるため、ドメイン変更時は siteConfig の
 * SITE_URL を書き換えるだけでよい。
 */
export function buildPageMetadata({
  title,
  description,
  path,
  withSiteName = true,
}: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const isHome = path === '/';
  // openGraph.title には title.template が適用されないため、ここで完全な形にする。
  const fullTitle = isHome
    ? `${siteConfig.name}｜${siteConfig.catchphrase}`
    : withSiteName
      ? `${title}｜${siteConfig.name}`
      : title;

  return {
    // トップページ（「屋号｜キャッチフレーズ」）と屋号を付けないページは、title.template を適用せず完全な形で使う。
    title: isHome || !withSiteName ? { absolute: fullTitle } : title,
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
