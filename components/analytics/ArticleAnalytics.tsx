'use client';

import { useAnalyticsPageContext } from '@/components/analytics/context';
import type { ArticleEventParams } from '@/lib/analytics/events';

/**
 * 記事詳細ページの計測コンテキストを登録する（画面には何も描画しない）。
 *
 * 記事ページに 1 つ置くだけで、そのページで発生する全イベント（page_view / scroll_XX /
 * cta_click など）に article_id・article_title・article_category・article_tags・
 * publish_date・updated_date・author が自動で付く。
 *
 * ※ パラメータはサーバー側（app/blog/[id]/page.tsx）で buildArticleAnalyticsParams() から作る。
 *   記事本文まで Client Component に渡さないようにするため、記事オブジェクトそのものは受け取らない。
 */
export default function ArticleAnalytics({ params }: { params: ArticleEventParams }) {
  useAnalyticsPageContext(params);
  return null;
}
