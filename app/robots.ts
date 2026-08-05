import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/siteConfig';

/** /robots.txt を生成する（Next.js のファイル規約）。 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
