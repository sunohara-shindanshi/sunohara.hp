import { findPublicImage } from '@/lib/publicImages';
import { siteConfig } from '@/lib/siteConfig';

/**
 * トップページ「当社の特徴」の項目。
 *
 * 文章はサイト内ですでに述べている内容（キャッチフレーズ・事業内容・代表者の考え方）から
 * 組み立てており、実績の数字や費用など、確認できていない事実は書いていない。
 * 項目の追加・削除・並べ替えはこの配列を編集するだけでよい（表示側の修正は不要）。
 */
export type Strength = {
  /**
   * イラスト画像のファイル名（public/strengths/{id}.png など）。
   * 並べ替えても画像がずれないよう、表示順ではなく項目ごとの固定の名前にしている。
   */
  id: string;
  title: string;
  body: string;
};

export const STRENGTHS: readonly Strength[] = [
  {
    id: 'strength-1',
    title: 'お金・人・売上・仕組みを、まとめて相談できる',
    body: '資金繰りの悩みの裏に人手不足があったり、売上の伸び悩みが業務の仕組みから来ていたり。経営の課題は一つの領域に収まりません。4つの領域をまとめて見られるので、悩みごとに相談先を分ける必要がありません。',
  },
  {
    id: 'strength-2',
    title: '提案書を渡して終わりにしない',
    body: `「${siteConfig.catchphrase}」を掲げているのはそのためです。現場に入り、経理の体制づくりや人事制度の運用、システムの導入まで、実際の作業に一緒に関わります。`,
  },
  {
    id: 'strength-3',
    title: '最後は社内だけで回せるように',
    body: '支援がずっと必要な状態はゴールではありません。担当者の育成や研修も含めて、事務所が手を離しても続けられる形を目指します。',
  },
];

/**
 * 「当社の特徴」のイラスト画像を探す（public/strengths/{id}.{拡張子}）。
 * 置き方は public/strengths/README.md。Server Component からのみ呼び出すこと。
 */
export function getStrengthIllustration(id: Strength['id']): string | null {
  return findPublicImage('strengths', id);
}
