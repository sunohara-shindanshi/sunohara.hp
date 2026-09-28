import BrandMotif from '@/components/BrandMotif';
import { STRENGTHS } from '@/lib/strengths';

/**
 * 段落内の **〜** を強調（<strong>）に変換する。
 * 文字列を分割して React 要素として並べるだけで、HTML としては解釈しない
 * （dangerouslySetInnerHTML は使わない）。
 */
function renderEmphasis(text: string) {
  // split に括弧付きの正規表現を渡すと、奇数番目に ** で囲まれた部分が入る
  return text.split(/\*\*(.+?)\*\*/).map((part, index) =>
    index % 2 === 1 ? (
      <strong
        key={index}
        // 下半分だけに黄色のマーカーを引く（文字色は読みやすさ優先で濃紺）
        className="bg-[linear-gradient(transparent_60%,rgba(247,200,104,0.55)_60%)] font-bold text-brand-navy"
      >
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

/**
 * トップページ「当社の特徴」。
 * 小さな見出し「当社の特徴」→ 四角い枠（キャッチフレーズ（中央・縦 3 段）→ 本文）、の順。
 * 本文は長文のため中央揃えにはせず、枠の中で左揃えにする。
 */
export default function Strengths() {
  const [before, after] = STRENGTHS.catchphrase.split('×');

  return (
    <div>
      <p className="text-center text-sm font-medium tracking-[0.22em] text-brand-accent">
        当社の特徴
      </p>

      {/*
        キャッチフレーズから本文までを四角い枠で囲む。
        角丸・影・背景色は付けない（角丸カードの多用を避ける方針）。線だけの四角にしている。
      */}
      <div className="mx-auto mt-6 max-w-3xl border border-brand-accent px-5 py-10 sm:px-12 sm:py-14">
        <div className="text-center">
          {/*
            「圧倒的な守備範囲 / × / 実行力」の縦 3 段。読み上げでは 1 つの見出しとして続けて読まれる。
            PC でも 36px（sm:text-4xl）止まりにしている（60px では大きすぎるとの指摘を受けて縮小）。
          */}
          <h2 className="font-display font-bold leading-tight tracking-jp text-brand-navy">
            <span className="block text-3xl sm:text-4xl">{before}</span>
            {after !== undefined ? (
              <>
                <span className="my-1 block text-xl text-brand-accent sm:text-2xl">×</span>
                <span className="block text-3xl sm:text-4xl">{after}</span>
              </>
            ) : null}
          </h2>
          <BrandMotif variant="rule" className="mx-auto mt-6 h-3 w-28 text-brand-accent" />
        </div>

        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-sm leading-loose text-brand-ink sm:text-base sm:leading-loose">
          {STRENGTHS.paragraphs.map((paragraph) => (
            // text-pretty：最終行に「す。」だけが残るような折り返しをブラウザに避けさせる
            // （対応ブラウザのみ。未対応でも通常どおり折り返されるだけ）
            <p key={paragraph} className="text-pretty">
              {renderEmphasis(paragraph)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
