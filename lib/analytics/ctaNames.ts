/**
 * CTA の識別子（cta_name）の一覧。
 *
 * GA4 のレポートで「どのボタンが押されたか」を区別するキーになるため、
 * 表記ゆれが起きないようここにまとめている。
 *
 * 命名規則：`<設置場所>_<行動>`（小文字 + アンダースコア）
 *   例）header_contact / article_bottom_contact / profile_note
 *
 * ボタンを増やすときは、ここに 1 行足して
 * `{...analyticsAttributes('cta_click', { cta_name: CTA_NAMES.XXX })}` を付けるだけでよい。
 * （GTM 側の設定変更は不要）
 */
export const CTA_NAMES = {
  /** ヘッダーの「相談する」（PC） */
  HEADER_CONTACT: 'header_contact',
  /** ヘッダーの「相談する」（モバイルメニュー） */
  HEADER_MOBILE_CONTACT: 'header_mobile_contact',
  /** ヘッダーの電話番号 */
  HEADER_TEL: 'header_tel',
  /** フッターの「お問い合わせはこちら」 */
  FOOTER_CONTACT: 'footer_contact',
  /** フッターの電話番号 */
  FOOTER_TEL: 'footer_tel',
  /** トップページのファーストビュー */
  HERO_CONTACT: 'hero_contact',
  /** トップページのファーストビューの電話番号 */
  HERO_TEL: 'hero_tel',
  /** 下層ページの見出し帯（PageHeader）のボタン */
  PAGE_HEADER_CONTACT: 'page_header_contact',
  /** 下層ページの見出し帯の電話番号 */
  PAGE_HEADER_TEL: 'page_header_tel',
  /** ページ末尾の CTA 帯（CtaSection）のボタン */
  SECTION_CONTACT: 'section_contact',
  /** ページ末尾の CTA 帯の電話番号 */
  SECTION_TEL: 'section_tel',
  /** 記事詳細のファーストビューの電話番号（電話を掲載している場合） */
  ARTICLE_HEADER_TEL: 'article_header_tel',
  /** 記事詳細のファーストビューのお問い合わせリンク（電話が非掲載の場合） */
  ARTICLE_HEADER_CONTACT: 'article_header_contact',
  /** 記事詳細サイドバーの「支援内容を見る」 */
  ARTICLE_SIDEBAR_SERVICES: 'article_sidebar_services',
  /** お問い合わせページの電話番号 */
  CONTACT_PAGE_TEL: 'contact_page_tel',
  /** 代表者プロフィールからのお問い合わせ */
  PROFILE_CONTACT: 'profile_contact',
} as const;

export type CtaName = (typeof CTA_NAMES)[keyof typeof CTA_NAMES];

/** CTA の設置場所（cta_location）。同じ cta_name を複数箇所で使う場合の補助情報。 */
export const CTA_LOCATIONS = {
  HEADER: 'header',
  FOOTER: 'footer',
  HERO: 'hero',
  PAGE_HEADER: 'page_header',
  ARTICLE: 'article',
  SECTION: 'section',
  PROFILE: 'profile',
} as const;

export type CtaLocation = (typeof CTA_LOCATIONS)[keyof typeof CTA_LOCATIONS];
