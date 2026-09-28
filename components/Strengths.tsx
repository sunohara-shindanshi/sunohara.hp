import BrandMotif from '@/components/BrandMotif';
import { STRENGTHS } from '@/lib/strengths';

/**
 * トップページ「当社の特徴」。
 * 小さな見出し「当社の特徴」→ キャッチフレーズ（中央・大きく）→ 本文、の順。
 * 本文は長文のため中央揃えにはせず、中央に置いた読みやすい幅の枠の中で左揃えにする。
 */
export default function Strengths() {
  // 「圧倒的な守備範囲」「×」「実行力」に分け、折り返すなら「×」の前だけにする
  const [before, after] = STRENGTHS.catchphrase.split('×');

  return (
    <div>
      <div className="text-center">
        <p className="text-sm font-medium tracking-[0.22em] text-brand-accent">当社の特徴</p>
        {/* スマホ（幅 375px）でも 1 行に収まる大きさ（26px）から始める */}
        <h2 className="mt-4 font-display text-[1.625rem] font-bold leading-tight tracking-jp text-brand-navy sm:text-4xl lg:text-5xl">
          <span className="inline-block">{before}</span>
          {after !== undefined ? (
            <span className="inline-block">
              <span className="mx-1 text-brand-accent sm:mx-2">×</span>
              {after}
            </span>
          ) : null}
        </h2>
        <BrandMotif variant="rule" className="mx-auto mt-5 h-3 w-28 text-brand-accent" />
      </div>

      <div className="mx-auto mt-10 max-w-2xl space-y-6 text-sm leading-loose text-brand-ink sm:text-base sm:leading-loose">
        {STRENGTHS.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
