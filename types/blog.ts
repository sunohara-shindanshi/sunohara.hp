/**
 * microCMS から取得するブログ記事・カテゴリの型定義。
 *
 * 「microCMS 設定仕様書」の 2 API 構成（categories / blogs）に対応する。
 * ※フィールド ID は仕様書のテーブルに準拠。実際のレスポンス構造は接続後に確認して調整すること。
 */

/** microCMS の画像フィールド */
export type MicroCMSImage = {
  url: string;
  width: number;
  height: number;
};

/** カテゴリ（categories API のコンテンツ） */
export type Category = {
  id: string;
  name: string;
  slug: string;
  /** 任意フィールド。カテゴリ一覧ページ等で使う場合のみ設定される */
  description?: string;
  /** 任意フィールド。ナビゲーションの並び順 */
  order?: number;
};

/**
 * ブログ記事一覧（blogs API）の 1 件。
 *
 * ※ microCMS 側では title / thumbnail / thumbnailAlt / category / excerpt を必須設定にする想定だが、
 *   スキーマ変更や参照先の削除に備えて、フロント側では thumbnail / category を null 許容にし、
 *   欠けている場合はフォールバック表示する（表示が壊れないようにするため）。
 */
export type BlogListItem = {
  /** microCMS が自動付与するコンテンツ ID（記事詳細ページの URL に使う） */
  id: string;
  title: string;
  thumbnail: MicroCMSImage | null;
  /** 画像フィールドに alt 管理機能がないため、別フィールドで管理する */
  thumbnailAlt: string;
  /**
   * カテゴリ。
   * ※実際の microCMS のスキーマが「複数選択のコンテンツ参照」だったため配列で受け取る。
   *   単一参照に変更された場合も表示が壊れないよう、取得時に配列へ正規化している。
   */
  categories: Category[];
  excerpt: string;
  /** ISO 8601 形式の公開日時（microCMS の組み込みフィールド） */
  publishedAt?: string;
};

/**
 * 記事詳細で扱う型（一覧の項目 + 本文）。
 *
 * ※ body はリッチエディタが返す HTML 文字列。表示時は必ず lib/sanitizeHtml.ts を通し、
 *   許可タグ・許可属性のホワイトリストで無害化してから挿入する（components/RichText.tsx）。
 */
export type BlogPost = BlogListItem & {
  body: string;
  /**
   * 「この記事でわかること」の箇条書き（各要素が 1 項目）。
   * microCMS 側は「複数行テキスト（1 行 1 項目）」または「繰り返しフィールド」を想定。
   * 未設定・未入力なら空配列。
   */
  keyPoints: string[];
  /**
   * この記事に手動で紐づけた「おすすめの記事」。
   * microCMS の blogs 側にある複数参照フィールド `articles` から取得する。未選択なら空配列。
   */
  recommendedPosts: BlogListItem[];
};

/** 記事本文から生成する目次の 1 項目 */
export type TocItem = {
  /** 本文中の見出しに振られた id（アンカーのリンク先） */
  id: string;
  /** 目次に表示する文言（タグを除いた見出しテキスト） */
  text: string;
  /** 見出しレベル（2 = h2、3 = h3。表示のインデントに使う） */
  level: 2 | 3;
};

/** sitemap.xml 用の最小情報 */
export type BlogSitemapEntry = {
  id: string;
  /** 最終更新日時（revisedAt があればそれを、なければ publishedAt / updatedAt を使う） */
  lastModified?: string;
};

/** microCMS のリスト形式 API のレスポンス */
export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

/**
 * ブログ一覧取得の結果。
 * - 'ok'             : 取得成功（0 件も含む）
 * - 'not-configured' : microCMS の接続情報（環境変数）が未設定
 * 通信失敗・API エラーは例外を投げ、app/blog/error.tsx で受け止める。
 */
export type BlogListResult =
  | { status: 'ok'; posts: BlogListItem[]; totalCount: number; pageSize: number }
  | { status: 'not-configured' };

/**
 * カテゴリ一覧取得の結果。
 * カテゴリ用エンドポイント（MICROCMS_CATEGORY_ENDPOINT）が未設定でも
 * 記事一覧は表示できるようにするため、記事一覧とは独立した結果型にしている。
 */
export type CategoryListResult =
  | { status: 'ok'; categories: Category[] }
  | { status: 'not-configured' };

