import type { MetadataRoute } from 'next';

import { buildBlogPostHref } from '@/lib/blogUrl';
import { fetchBlogSitemapEntries } from '@/lib/microcms';
import { NAV_ITEMS, SITE_URL } from '@/lib/siteConfig';

/**
 * /sitemap.xml を生成する（Next.js のファイル規約）。
 *
 * 固定ページは NAV_ITEMS（= サイト内の全 5 ページ）から、記事 URL は microCMS から生成する。
 * 末尾スラッシュは next.config.ts の trailingSlash: false に合わせて付けない。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = NAV_ITEMS.map((item) => ({
    url: `${SITE_URL}${item.href === '/' ? '' : item.href}`,
    lastModified: now,
    changeFrequency: item.href === '/blog' ? 'weekly' : 'monthly',
    priority: item.href === '/' ? 1 : 0.8,
  }));

  // microCMS に到達できない場合でも sitemap 自体は生成できるようにする
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const entries = await fetchBlogSitemapEntries();
    articlePages = entries.map((entry) => ({
      url: `${SITE_URL}${buildBlogPostHref(entry.id)}`,
      lastModified: entry.lastModified ? new Date(entry.lastModified) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('[sitemap] 記事一覧の取得に失敗しました', error);
  }

  return [...staticPages, ...articlePages];
}
