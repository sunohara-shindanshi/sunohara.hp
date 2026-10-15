/**
 * 「便利ツール一覧」（/tools）のデータ。microCMS の tools API（1 つだけ）から取得する。
 * 分類は tools の category（セレクトフィールド）で選ぶ。
 * （microCMS の無料プランは API の数に上限があるため、分類専用の API は作らない方針）
 * フィールドの作り方は README「便利ツール一覧（microCMS）」を参照。
 */

import type { Service } from '@/lib/services';

/** 一覧での分類（ツールの category の値から組み立てる） */
export type ToolCategory = {
  /** ページ内リンク用の識別子（英数字） */
  id: string;
  name: string;
  /** 分類名が事業内容の名前と一致すれば、その事業の id（詳細ページへの案内に使う） */
  serviceId?: Service['id'];
};

export type Tool = {
  id: string;
  name: string;
  /** 公式サイトの URL（http / https のみ。それ以外は null にして表示しない） */
  url: string | null;
  /** 一覧に出すひとこと説明 */
  summary: string;
  /** 詳細（使い方など。リッチエディタの生 HTML。表示前に必ず lib/richText.ts でサニタイズする） */
  detail: string;
  /** 使い方を詳しく解説したブログ記事（任意） */
  article: { id: string; title: string } | null;
  /** 掲載情報の確認日（任意。ISO 8601） */
  checkedAt?: string;
  /** 分類内の表示順（小さいほど上。未入力は名前順で後ろ） */
  order?: number;
  /** 分類名（セレクトフィールドの値）。未選択は null（「その他」に入れる） */
  category: string | null;
};

export type ToolDirectory = {
  /** 表示順に並んだ分類とツール（ツールが 1 件も無い分類は含まない） */
  groups: { category: ToolCategory; tools: Tool[] }[];
};
