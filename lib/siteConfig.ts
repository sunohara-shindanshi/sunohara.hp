/**
 * サイト共通の固定情報の「唯一の参照元」。
 *
 * 屋号・キャッチフレーズ・住所・電話番号などは必ずこのファイルから参照すること。
 * コンポーネントやメタデータ生成箇所で同じ文字列を直書きすると表記ゆれの原因になる。
 */

/**
 * 本番ドメイン（仮）。
 * TODO: 実際のドメインが決まったら、この定数だけを書き換える。
 * （sitemap / robots / canonical / OGP はすべてここを参照している）
 */
export const SITE_URL = 'https://example.com';

const address = {
  region: '東京都',
  locality: '葛飾区',
  street: '奥戸3-20-1',
} as const;

export const siteConfig = {
  /** 屋号 */
  name: '春原中小企業診断士事務所',
  /** キャッチフレーズ（この表記を改変しない） */
  catchphrase: '超・現場主義',
  /** 所在地（表示用の一行表記。分割表記から組み立てて表記ゆれを防ぐ） */
  address: {
    ...address,
    full: `${address.region}${address.locality}${address.street}`,
  },
  /** 電話番号（表示用） */
  tel: '080-6935-6869',
  /** 代表者
   *  TODO: 代表者氏名は未確定のためプレースホルダー。README「差し替えが必要な箇所」を参照。 */
  representative: {
    name: '春原 功貴',
    title: '代表 / 中小企業診断士',
    /**
     * 代表者の顔写真。
     * public/ に画像を置き、そのパスを設定する（例: '/representative.webp'）。
     * 元が JPEG / PNG でも next/image が WebP に変換して配信するため、拡張子は問わない。
     * null の間は「準備中」のプレースホルダーを表示する。
     */
    image: '/代表者写真.jpg' as string | null,
  },
  /**
   * 相談窓口の訴求情報（CTA に表示）。
   * ※ 事実のみを記載する。費用（初回無料など）・締切・キャンペーンは未確認のため設定していない。
   */
  consultation: {
    /** オンライン相談への対応可否（確認済み: 可） */
    online: true,
    /**
     * 相談の所要時間の目安。CTA に「所要時間の目安：〇〇」として表示する。
     * TODO: 実際の目安を記入する（例: '初回は30分ほど'）。null の間は表示しない。
     */
    durationNote: null as string | null,
  },
  /** サイト全体のデフォルト説明文 */
  description:
    '口だけでは、会社は変わらない。私たちが大切にしているのは「超・現場主義」。提案して終わりではなく、現場に入り込み、実行まで一緒に手を動かします。事業再生、AI・IT活用、バックオフィス整備。東京都葛飾区を拠点に、御社が自走できる状態を目指して支援します。',
} as const;

/** tel: リンク用のハイフンなし電話番号（表示用の tel から機械的に生成する） */
export const telHref = `tel:${siteConfig.tel.replace(/-/g, '')}`;

/** サイト内の全ページ。ヘッダー / フッター / sitemap.ts が同じ配列を参照する。 */
export const NAV_ITEMS = [
  { href: '/', label: 'ホーム' },
  { href: '/services', label: '事業内容' },
  { href: '/about', label: '基本情報' },
  { href: '/blog', label: 'ブログ' },
  { href: '/contact', label: 'お問い合わせ' },
] as const;
