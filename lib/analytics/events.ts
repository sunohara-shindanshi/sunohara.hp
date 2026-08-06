/**
 * 計測イベントの「唯一の定義元」。
 *
 * ここに無いイベント名は送信できない（型エラーになる）。
 * イベント名の文字列をコンポーネント側に直接書かないこと。
 * 追加手順は docs/analytics.md「イベントを追加する手順」を参照。
 */

/**
 * 送信するイベント名。
 * ※ この値は GA4 / GTM 側の設定と直結しているため、原則として変更しない。
 */
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  SCROLL_25: 'scroll_25',
  SCROLL_50: 'scroll_50',
  SCROLL_75: 'scroll_75',
  SCROLL_100: 'scroll_100',
  CTA_CLICK: 'cta_click',
  RELATED_ARTICLE_CLICK: 'related_article_click',
  EXTERNAL_LINK_CLICK: 'external_link_click',
  PDF_DOWNLOAD: 'pdf_download',
  ARTICLE_SELECT: 'article_select',
  CATEGORY_SELECT: 'category_select',
  TAG_SELECT: 'tag_select',
  FORM_VIEW: 'form_view',
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  TOC_CLICK: 'toc_click',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** スクロール率イベントのしきい値（この順に 1 度ずつ送信する） */
export const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;
export type ScrollThreshold = (typeof SCROLL_THRESHOLDS)[number];

/** しきい値からイベント名を引く（scroll_25 などの文字列を組み立てで作らないため） */
export const SCROLL_EVENT_BY_THRESHOLD = {
  25: ANALYTICS_EVENTS.SCROLL_25,
  50: ANALYTICS_EVENTS.SCROLL_50,
  75: ANALYTICS_EVENTS.SCROLL_75,
  100: ANALYTICS_EVENTS.SCROLL_100,
} as const satisfies Record<ScrollThreshold, AnalyticsEventName>;

/**
 * 全イベントに自動付与される共通パラメータ（AnalyticsProvider が付ける）。
 * 各コンポーネントがこれらを渡す必要はない。
 */
export type CommonEventParams = {
  /** 現在のパス + クエリ（例: /blog?page=2） */
  page_path: string;
  /** 現在の絶対 URL（UTM パラメータを含む） */
  page_location: string;
  /** <title> の内容 */
  page_title: string;
};

/**
 * 記事コンテキスト。
 * 記事詳細ページでは、そのページで発生した全イベントに自動付与される
 * （components/analytics/ArticleAnalytics.tsx が登録する）。
 * GA4 のカスタムディメンションは文字列前提のため、配列は カンマ区切り文字列にして渡す。
 */
export type ArticleEventParams = {
  article_id?: string;
  /**
   * 記事の slug（URL の末尾。例: bank-loan）。
   * microCMS に slug フィールドがあればその値、無ければ URL に使っているコンテンツ ID。
   */
  article_slug?: string;
  article_title?: string;
  /** カテゴリ名（複数ある場合はカンマ区切り） */
  article_category?: string;
  /** タグ名（複数ある場合はカンマ区切り） */
  article_tags?: string;
  /** 公開日（YYYY-MM-DD） */
  publish_date?: string;
  /** 公開年（publish_date から自動算出。例: 2026） */
  publish_year?: number;
  /** 更新日（YYYY-MM-DD） */
  updated_date?: string;
  /** 公開日より後に更新されているか（同日は false） */
  is_updated?: boolean;
  /** 本文の文字数（HTML タグ・空白を除く） */
  word_count?: number;
  /** 推定読了時間（分・整数。日本語 500 文字/分で算出） */
  reading_time?: number;
  author?: string;
};

/** 記事コンテキストのキー一覧（未設定ページで値を打ち消すために使う） */
export const ARTICLE_PARAM_KEYS = [
  'article_id',
  'article_slug',
  'article_title',
  'article_category',
  'article_tags',
  'publish_date',
  'publish_year',
  'updated_date',
  'is_updated',
  'word_count',
  'reading_time',
  'author',
] as const satisfies readonly (keyof ArticleEventParams)[];

/**
 * data 属性（文字列）から読み戻すときに数値・真偽値へ戻すパラメータ。
 *
 * HTML の属性値は必ず文字列になるため、そのまま送ると page_view（実値を push）と
 * article_select（属性から復元）で型が食い違い、GA4 のカスタム指標が集計できなくなる。
 * ここに登録したキーだけを型変換して、送信される値の型を全イベントで揃える。
 */
export const NUMERIC_PARAM_KEYS: ReadonlySet<string> = new Set([
  'publish_year',
  'word_count',
  'reading_time',
  'percent_scrolled',
  'toc_level',
]);

export const BOOLEAN_PARAM_KEYS: ReadonlySet<string> = new Set(['is_updated']);

type ScrollParams = {
  /** 到達したスクロール率（25 / 50 / 75 / 100） */
  percent_scrolled: ScrollThreshold;
};

type CtaClickParams = {
  /** CTA の識別子（例: header_contact）。lib/analytics/ctaNames.ts の命名規則に従う */
  cta_name: string;
  /** CTA の設置場所（例: header / article_bottom）。省略可 */
  cta_location?: string;
  /** 遷移先 URL */
  link_url?: string;
};

type RelatedArticleClickParams = {
  /** 遷移元の記事 ID */
  from_article: string;
  /** 遷移先の記事 ID */
  to_article: string;
  /** 遷移先記事のカテゴリ名 */
  category?: string;
  /** どのリストからの遷移か（おすすめの記事 / 関連記事 / 最近の投稿） */
  list_name?: string;
};

type ExternalLinkClickParams = {
  link_url: string;
  /** リンクの表示テキスト（画像リンクの場合は alt / aria-label） */
  link_text: string;
};

type PdfDownloadParams = {
  file_name: string;
  file_url: string;
};

/**
 * 一覧からクリックされた記事の情報。
 * ※ 本文を取得しない一覧 API から作るため、word_count / reading_time は含まれない
 *   （記事ページに遷移した後の page_view で取得できる）。
 */
type ArticleSelectParams = {
  /** クリックされた記事の ID */
  article_id: string;
  article_slug: string;
  article_title: string;
  article_category?: string;
  article_tags?: string;
  publish_date?: string;
  publish_year?: number;
  updated_date?: string;
  is_updated?: boolean;
  /** どの一覧からの遷移か（blog_list / home_recent など） */
  list_name?: string;
};

type TocClickParams = {
  /** クリックされた目次項目の文言 */
  toc_text: string;
  /** 飛び先のアンカー（例: #heading-3） */
  toc_anchor: string;
  /** 見出しレベル（2 = H2、3 = H3） */
  toc_level: 2 | 3;
};

type CategorySelectParams = {
  category_name: string;
  category_slug?: string;
  list_name?: string;
};

type TagSelectParams = {
  tag_name: string;
  tag_slug?: string;
  list_name?: string;
};

type FormParams = {
  /** フォームの識別子（例: contact） */
  form_name: string;
  /** 選択されたご相談内容など、フォーム固有の補足。省略可 */
  form_id?: string;
};

/**
 * イベント名 → そのイベント固有のパラメータ、の対応表。
 * trackEvent の第 2 引数はこの表から型が決まる。
 */
export type AnalyticsEventParamsMap = {
  page_view: { page_referrer?: string };
  scroll_25: ScrollParams;
  scroll_50: ScrollParams;
  scroll_75: ScrollParams;
  scroll_100: ScrollParams;
  cta_click: CtaClickParams;
  related_article_click: RelatedArticleClickParams;
  external_link_click: ExternalLinkClickParams;
  pdf_download: PdfDownloadParams;
  article_select: ArticleSelectParams;
  category_select: CategorySelectParams;
  tag_select: TagSelectParams;
  form_view: FormParams;
  form_start: FormParams;
  form_submit: FormParams;
  toc_click: TocClickParams;
};

/** trackEvent の型（AnalyticsProvider が提供する関数の形） */
export type TrackEvent = <E extends AnalyticsEventName>(
  event: E,
  params: AnalyticsEventParamsMap[E],
) => void;
