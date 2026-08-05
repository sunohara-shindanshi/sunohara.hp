import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

/**
 * ブランドの配色・フォントはすべてこのファイルに集約する。
 * コンポーネント側で新しい色や独自クラスを定義せず、ここで定義したユーティリティ
 * （bg-brand-bg / text-brand-navy / text-brand-accent など）を使うこと。
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // よく晴れた青空をイメージした配色。全体を明るく保ち、濃い面はフッターなど最小限にとどめる。
        brand: {
          /** ページ全体の背景：晴れた日の空の淡い色 */
          bg: '#F2FAFF',
          /** カード・パネルの背景 */
          surface: '#FFFFFF',
          /** 見出し・濃い面（フッター）に使う青。白背景で 7.6:1 */
          navy: '#0F5486',
          /** navy の一段明るいトーン（ホバー） */
          navysoft: '#1E79B8',
          /**
           * アクセント：青空のブルー。
           * 文字色・塗りボタンに使うため、白とのコントラスト比 4.85:1（WCAG AA 適合）を満たす明度にしている。
           * これより明るい空色は装飾（sky / accentsoft）としてのみ使うこと。
           */
          accent: '#1A76B8',
          /** アクセントの淡いトーン（罫線・背景の面。文字色には使わない） */
          accentsoft: '#D6EEFF',
          /** 明るい空色（装飾専用。文字色・文字の背景には使わない） */
          sky: '#7FCDF5',
          /** 差し色：陽だまりの黄色（装飾専用） */
          sun: '#FFD25E',
          /** 罫線 */
          line: '#DCEEFB',
          /** 本文テキスト */
          ink: '#33414F',
          /**
           * 補足テキスト。白・淡い背景でのみ使う。
           * ヒーローの空グラデーション上では 3.3:1 になり基準を下回るため、そこでは ink を使うこと。
           */
          muted: '#5C7080',
        },
      },
      fontFamily: {
        // サイト全体を Noto Sans JP に統一する（app/layout.tsx で読み込み）。
        // 読み込み前・失敗時は端末標準のゴシック体へフォールバックする。
        // sans（本文）/ display（見出し）/ mincho（キャッチフレーズ）はすべて同じ書体で、
        // 太さの違い（font-bold 等）だけで見出しを表現する。
        // ※ 3 つの別名は過去の使い分けの名残。className の一括置換を避けるため残しているが、
        //   実体はすべて Noto Sans JP。
        sans: [
          'var(--font-noto-sans-jp)',
          'Hiragino Kaku Gothic ProN',
          'BIZ UDPGothic',
          'Yu Gothic',
          'Meiryo',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'var(--font-noto-sans-jp)',
          'Hiragino Kaku Gothic ProN',
          'BIZ UDPGothic',
          'Yu Gothic',
          'Meiryo',
          'system-ui',
          'sans-serif',
        ],
        mincho: [
          'var(--font-noto-sans-jp)',
          'Hiragino Kaku Gothic ProN',
          'BIZ UDPGothic',
          'Yu Gothic',
          'Meiryo',
          'system-ui',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '72rem',
      },
      boxShadow: {
        // やわらかく浮かせる影（親しみやすさのためコントラストは強くしない）
        panel: '0 1px 2px rgba(27, 68, 112, 0.04), 0 14px 34px -22px rgba(27, 68, 112, 0.4)',
      },
      backgroundImage: {
        // ヒーロー用の青空グラデーション（上が白に近い空、下にいくほど青が濃くなる）。
        // 文字は白ではなく brand-navy / brand-ink を重ねる前提で、いちばん濃い色でも
        // 見出し 5.1:1 / 本文 6.6:1 のコントラストを確保している。
        sky: 'linear-gradient(170deg, #EAF7FF 0%, #C7E7FB 48%, #9BD6F6 100%)',
      },
      letterSpacing: {
        jp: '0.04em',
      },
      // ブログ本文（リッチエディタの HTML）用のタイポグラフィ。prose-brand で適用する。
      typography: {
        brand: {
          css: {
            '--tw-prose-body': '#26313F',
            '--tw-prose-headings': '#14304F',
            '--tw-prose-links': '#2E7BB8',
            '--tw-prose-bold': '#14304F',
            '--tw-prose-quotes': '#24466B',
            '--tw-prose-quote-borders': '#CFE0EF',
            '--tw-prose-bullets': '#2E7BB8',
            '--tw-prose-hr': '#DCE7F1',
            '--tw-prose-th-borders': '#DCE7F1',
            '--tw-prose-td-borders': '#DCE7F1',
            '--tw-prose-captions': '#5A6B7D',
            '--tw-prose-code': '#14304F',
            '--tw-prose-pre-bg': '#14304F',
            lineHeight: '2',
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
