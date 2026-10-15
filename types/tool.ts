/**
 * 「便利ツール一覧」（/tools）のデータ。microCMS の 2 API から取得する。
 * - tool-categories : 分類（財務・資金／組織・人事／営業・売上／IT・システム／その他 など）
 * - tools           : ツール本体（分類は tool-categories への単一参照）
 * フィールドの作り方は README「便利ツール一覧（microCMS）」を参照。
 */

import type { Service } from '@/lib/services';

export type ToolCategory = {
  id: string;
  name: string;
  /** 分類の説明（任意） */
  description?: string;
  /** 表示順（小さいほど上。未入力は最後） */
  order?: number;
  /** 関連する事業内容（任意）。入っていれば「この領域のご相談」として詳細ページへリンクする */
  serviceId?: Service['id'];
};

export type Tool = {
  id: string;
  name: string;
  /** 公式サイトの URL（http / https のみ。それ以外は null にして表示しない） */
  url: string | null;
  /** 一覧に出すひとこと説明 */
  summary: string;
  /** 料金の区分（例：完全無料／無料プランあり）。未入力なら表示しない */
  pricing?: string;
  /** 詳細（使い方など。リッチエディタの生 HTML。表示前に必ず lib/richText.ts でサニタイズする） */
  detail: string;
  /** 使い方を詳しく解説したブログ記事（任意） */
  article: { id: string; title: string } | null;
  /** 掲載情報の確認日（任意。ISO 8601） */
  checkedAt?: string;
  /** 分類内の表示順（小さいほど上。未入力は名前順で後ろ） */
  order?: number;
  categoryId: string | null;
};

export type ToolDirectory = {
  categories: ToolCategory[];
  tools: Tool[];
};
