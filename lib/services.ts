/**
 * 事業内容（4領域）の唯一の参照元。
 * トップページ・事業内容ページ・お問い合わせフォームのセレクトは、すべてこの配列を参照する。
 * 順序と名称を変更する場合はここだけを編集すること。
 */

export type Service = {
  /**
   * 識別子（英小文字とハイフンのみ）。次の 3 か所で共通に使う。
   * - 詳細ページの URL（/services/{id}）
   * - microCMS「事業内容」API のコンテンツ ID
   * - イラスト画像のファイル名（public/services/{id}.png など）
   * 公開後に変えると URL が変わる（検索結果・ブックマークが切れる）ため、変更しないこと。
   */
  id: 'finance' | 'hr' | 'sales' | 'it';
  /** 領域名 */
  title: string;
  /** 領域名に添えるひとこと（「〜にまつわる悩み」） */
  subtitle: string;
  /** カード・一覧で使う短い説明（points をつないだもの） */
  description: string;
  /** 具体的な支援メニュー（カード内・詳細の箇条書きで使用） */
  points: readonly string[];
  /**
   * 詳細ページ（/services/{id}）冒頭の説明文の既定値。
   * microCMS の lead を入力するとそちらが優先される。
   */
  detail: string;
};

export const SERVICES: readonly Service[] = [
  {
    id: 'finance',
    title: '財務・資金',
    subtitle: 'お金にまつわる悩み',
    description: '財務・経理体制構築、数字の見える化、資金調達、助成金・補助金申請',
    points: [
      '財務・経理体制構築（実務レベル〜人材育成まで）',
      '数字の見える化',
      '資金調達',
      '助成金・補助金申請',
    ],
    detail:
      '経理や資金繰りは、数字が見えていないと判断も後手に回ります。まず実務が回る経理体制をつくり、そこから資金調達や助成金・補助金の申請まで進めます。将来的には社内の担当者だけで数字を扱えるよう、育成にも力を入れています。',
  },
  {
    id: 'hr',
    title: '組織・人事',
    subtitle: '人にまつわる悩み',
    description: '労務管理・給与計算、評価制度の導入、人事施策の策定＆実行、研修',
    points: [
      '労務管理・給与計算',
      '評価制度の導入',
      '人事施策の策定＆実行',
      '研修',
    ],
    detail:
      '労務管理や給与計算といった土台の整備から、評価制度や人事施策の実行、研修まで幅広く関わります。制度を作って渡すだけでは現場に根付かないため、実際に運用が回り出すところまで見届けます。',
  },
  {
    id: 'sales',
    title: '営業・売上',
    subtitle: '売上にまつわる悩み',
    description: '営業支援、業務効率化支援（営業プロセス関連）',
    points: ['営業支援', '業務効率化支援（営業プロセス関連）'],
    detail:
      '営業は気合や根性ではなく、再現できる仕組みがあるかどうかで結果が変わります。営業活動そのものの伴走に加えて、プロセスに潜むムダを洗い出し、少ない工数で成果が積み上がる形に組み直します。',
  },
  {
    id: 'it',
    title: 'IT・システム',
    subtitle: '仕組みにまつわる悩み',
    description: '新規システム開発・導入、業務効率化支援（システム関連）',
    points: ['新規システム開発・導入', '業務効率化支援（システム関連）'],
    detail:
      'システムは導入すること自体が目的になりがちですが、大事なのは現場が実際に使えるかどうかです。新規開発・導入から既存業務の効率化まで、業務の実態に合わせて設計し、無理なく定着する形に落とし込みます。',
  },
] as const;

/** 事業ごとの詳細ページの URL */
export function buildServiceHref(id: Service['id']): string {
  return `/services/${id}`;
}

/** URL の id から事業を探す（該当なしは undefined） */
export function findService(id: string): Service | undefined {
  return SERVICES.find((service) => service.id === id);
}

/** お問い合わせフォームの「ご相談内容」セレクトの選択肢（事業内容と順序・名称を揃える） */
export const CONTACT_SUBJECTS: readonly string[] = [
  ...SERVICES.map((service) => `${service.title}について`),
  'その他',
];
