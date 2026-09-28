import type { MicroCMSImage } from '@/types/blog';

/**
 * microCMS の「事業内容」API（services）から取得する、事業ごとの詳細ページの本文。
 *
 * 1 コンテンツ = 1 事業。コンテンツ ID は lib/services.ts の id（finance / hr / sales / it）と揃える。
 * 事業名・「〜にまつわる悩み」・一覧の箇条書きはお問い合わせフォームの選択肢と連動しているため
 * microCMS には持たせず、lib/services.ts を唯一の参照元にしている。
 * フィールドの作り方は README「事業内容の詳細ページ（microCMS）」を参照。
 */

/** 詳細ページの 1 ブロック（「やること」の見出し + 詳細 + 画像） */
export type ServiceSection = {
  /** 見出し（例：経理体制の構築） */
  heading: string;
  /** 詳細（リッチエディタの生 HTML。表示前に必ず lib/richText.ts でサニタイズする） */
  body: string;
  /** 画像（任意） */
  image: MicroCMSImage | null;
  /** 画像の代替テキスト（任意） */
  imageAlt: string;
};

export type ServicePageContent = {
  /** ページ冒頭の説明文（任意。未入力なら lib/services.ts の detail を使う） */
  lead?: string;
  /** 「やること」のブロック。事業ごとに個数が違ってよい */
  sections: ServiceSection[];
};
