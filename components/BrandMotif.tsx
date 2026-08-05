/**
 * ブランドの視覚モチーフ：「現場で押し上げる折れ線」。
 *
 * 経営指標の推移を示す折れ線をモチーフにし、サイト内の装飾はこの 1 種類に統一する。
 * 新しい装飾グラフィックを別ファイルで増やさず、必要な形は variant として追加すること。
 *
 * - 'hero' : ファーストビュー背景の大きな折れ線
 * - 'rule' : 見出し下の罫線（右端が立ち上がる）
 * - 'mark' : ロゴ・箇条書きに使う小さなマーク
 */

type BrandMotifProps = {
  variant: 'hero' | 'rule' | 'mark';
  className?: string;
};

export default function BrandMotif({ variant, className }: BrandMotifProps) {
  if (variant === 'hero') {
    return (
      <svg
        viewBox="0 0 720 360"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* 方眼（現場のノート・グラフ用紙のニュアンス） */}
        <g stroke="currentColor" strokeWidth="1" opacity="0.18">
          {[60, 120, 180, 240, 300].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="720" y2={y} />
          ))}
          {[120, 240, 360, 480, 600].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="360" />
          ))}
        </g>

        {/* 折れ線の下の面 */}
        <path
          d="M0 300 L120 268 L240 286 L360 214 L480 232 L600 140 L720 96 L720 360 L0 360 Z"
          fill="currentColor"
          opacity="0.1"
        />

        {/* 折れ線本体 */}
        <polyline
          points="0,300 120,268 240,286 360,214 480,232 600,140 720,96"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 転換点 */}
        {[
          [240, 286],
          [480, 232],
          [720, 96],
        ].map(([x, y]) => (
          <circle key={`p-${x}`} cx={x} cy={y} r="6" fill="currentColor" />
        ))}
      </svg>
    );
  }

  if (variant === 'rule') {
    return (
      <svg
        viewBox="0 0 240 16"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
        preserveAspectRatio="none"
      >
        <polyline
          points="0,13 150,13 176,13 200,4 240,4"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="7"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.45"
      />
      <polyline
        points="8,22 14,17 19,20 25,10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="10" r="2.6" fill="currentColor" />
    </svg>
  );
}
