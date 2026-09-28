# 引き継ぎメモ（作業の経緯と現状）

セッションをまたいで作業を続けるための引き継ぎファイルです。
新しい作業を始める前にこのファイルを読み、作業後は末尾の「更新履歴」に追記してください。

- 最終更新：2026-09-28
- プロジェクト：春原中小企業診断士事務所 コーポレートサイト（https://www.sunohara-cs.com）
- 作業フォルダ：`C:\Users\suno_\Desktop\春原功貴\中小企業診断士\春原中小企業診断士事務所HP`
  （※ 以前は `春原中小企業診断士事務所HP_ver.2` という名前だった。リネーム済み）

---

## 1. 現在の状態（最重要）

### Git ブランチ

| ブランチ | 内容 |
|---|---|
| `main` | **「現在の本番相当のHP」**。コミット `f50d127`（文章・配色の見直し）まで |
| `layout/arights-comparison` | arights.com を参考にしたレイアウト改修。`main` から分岐し、以下 4 コミットを追加 |
| `feature/service-pages` ← **今ここ** | 事業ごとの詳細ページ（本文は microCMS）。`layout/arights-comparison` から分岐 |

ブランチは `main` → `layout/arights-comparison` → `feature/service-pages` の順に積み重なっている。
`feature/service-pages` を `main` にマージすると、レイアウト改修もまとめて入る点に注意。

`layout/arights-comparison` の追加コミット：

1. `c4bb2b7` 事業内容の一覧をカードなしのプレーンなリストに変更
2. `e988efe` セクションの背景色を交互にし、代表者写真をLCP優先読み込みに
3. `2cd98c2` 事業内容の見出しと補足（カッコ書き）を別行に分離
4. `9f66379` 説明文の不自然な改行を修正し、事業内容にイラスト画像の差し込み口を追加

- **まだ `main` にマージしていない。** ユーザーが採用を決めたらマージする。
- 元に戻したいときは `git checkout main` だけでよい（ユーザーの要望「いつでも現在のHPに修復できるように」への対応）。
  詳細ページだけ外したいときは `git checkout layout/arights-comparison`。

### ユーザー待ちの項目

- **事業内容のイラスト画像**：ユーザーが探して `public/services/` に置く予定。
  ファイル名は `finance` / `hr` / `sales` / `it` ＋ 拡張子（webp/png/jpg/jpeg）。
  置けば自動で表示される（コード変更不要）。手順は `public/services/README.md`。
- **ブランチのマージ判断**（上記）。
- **microCMS に「事業内容」API（`services`）を作成し、4 事業分の本文を入力**。
  作り方は README「7. ブログ（microCMS）」→「事業内容の詳細ページ」。
  コンテンツ ID を `finance` / `hr` / `sales` / `it` にするのを忘れると表示されない（仮表示のまま）。
  作成されるまでは `lib/services.ts` の文章で仮表示している。
- **相談の所要時間**：`lib/siteConfig.ts` の `consultation.durationNote` が `null` のまま（実際の目安が決まったら記入）。
- **note / X の URL**：`lib/siteConfig.ts` の `SOCIAL_LINKS` の `url` が `null`（入れると基本情報ページに自動表示＋計測）。

---

## 2. 技術構成

- Next.js 16（App Router / Turbopack）、React 19、TypeScript、Tailwind CSS v3.4 ＋ @tailwindcss/typography
- ブログ：microCMS（API: `blogs` / `categories`）。接続情報は `.env.local`
- お問い合わせ：Server Action ＋ Resend（通知先 `sunohara.shindanshi@gmail.com`、`CONTACT_TO_EMAIL` で変更可）
- 計測：Google Tag Manager（`GTM-56BC4P4W`）→ GA4（`G-VY959R184H`）。詳細は `docs/analytics.md`
- フォント：Noto Sans JP（`next/font/google`、可変フォント、日本語グリフも正しく読み込まれていることを検証済み）
- 検証コマンド：`npm run lint` / `npx tsc --noEmit` / `npm run build`

---

## 3. これまでに行った主な作業（要点）

### 初期構築〜ブログ
- 5ページ構成（`/` `/services` `/about` `/blog` `/contact`）、SEO（Metadata API、sitemap、robots、JSON-LD）
- microCMS ブログ：記事詳細、関連記事・最近の投稿・おすすめ記事（記事ごとの `articles` フィールド）、
  「この記事でわかること」（`keyPoints`）、開閉式の目次、コラム枠（本文で class="column"）
- 本文の見出しはサニタイズで1段下げている（microCMS の 見出し1→`h2`、見出し2→`h3`、見出し3→`h4`）
- 見出しデザイン：見出し1＝左の縦線、見出し2＝文字幅の下線、見出し3＝先頭ハイフン（`app/globals.css`）
- 画像は WebP 配信（`next/image` と microCMS 画像の `fm=webp`）

### 計測（GA4 + GTM）
- `trackEvent()` → `dataLayer.push()` → GTM → GA4 の構成。イベント名は `lib/analytics/events.ts` で一元管理
- 記事パラメータ（article_id / slug / word_count / reading_time / publish_year / is_updated 等）、目次クリック（toc_click）
- カスタムディメンションは高カーディナリティを避け **9個＋指標1個** に絞った（`docs/analytics.md` 6章）
- `article_slug` は URL（`/blog/{id}`）から取得。microCMS の slug フィールドは使わない方針
- 同意管理（Cookie バナー／Consent Mode）は **実装しない方針**（ユーザー決定）

### 各種修正
- 電話番号は **非掲載**（`siteConfig.tel = null`。値を入れれば全ページで復活する作り）
- Google 検索スニペットに自己紹介記事の抜粋が出る問題：一覧カードの抜粋に `data-nosnippet`、トップの description に代表者名
- microCMS の「埋め込み」（Iframely）がサニタイズで消える問題：
  自サイト記事は記事カードに、YouTube は `youtube-nocookie.com/embed/ID` の iframe に、その他はリンク表示に差し替え（`lib/richText.ts`）。
  外部 script は許可していない（XSS 対策）

### 「AIっぽさ」をなくす一連の作業（直近）
1. **文章**：同じ定型句（「会社全体を見ながら、一緒に手を動かします」等）の使い回しを解消、代表者挨拶の「引用→対比」構成をやめた
2. **装飾**：ぼかした円をトップのヒーロー1個だけに削減
3. **配色**：一度彩度を落としたが「青空なのに暗すぎる」と指摘され、**明るい青空の配色に戻した**。CTA の黄色だけ少し落ち着いた `#F7C868`
4. **レイアウト**（arights.com を参考、ブランチ上）：
   - 事業内容をカードなし（角丸・影・背景なし）のプレーンなリストに（`components/ServiceListItem.tsx`、旧 ServiceCard は削除）
   - セクション背景を白／水色で交互に
   - 事業内容の見出しと「（〜にまつわる悩み）」を別行に
   - トップの事業内容説明文を短くして不自然な改行を解消
   - イラスト画像の差し込み口（`lib/serviceImages.ts`）

### 事業ごとの詳細ページ（`feature/service-pages` ブランチ）
- URL は `/services/finance` `/services/hr` `/services/sales` `/services/it`（`app/services/[id]/page.tsx`）
- 本文は microCMS の `services` API（リスト形式、1 コンテンツ = 1 事業、コンテンツ ID = 事業の id）
  - `lead`（冒頭の説明文）＋ `sections`（繰り返し：`heading` / `body` / `image` / `imageAlt`）
  - 「やること」の個数は事業ごとに自由（ユーザー要望：「タイトル＋詳細」が事業によっていくつかある形）
- 事業名・「〜にまつわる悩み」・箇条書き・ページの数は `lib/services.ts` のまま（問い合わせフォームと連動するため）
- ユーザーの選択（2026-09-28）：画像は **PC で左右交互**／`/services` は **一覧＋流れだけ**にして旧「各領域の詳細」ブロックを削除／
  microCMS 未入力の事業は **今の文章で仮表示**
- 一覧（トップ・/services）の見出しと「詳しく見る」、フッター、基本情報ページの「支援できること」から詳細ページへリンク
- パンくず（表示＋ BreadcrumbList）、Service の JSON-LD、sitemap に 4 ページ追加、末尾 CTA の計測名 `service_detail_contact`
- `/services` の「支援開始までの流れ」の白い角丸カードを外し、罫線区切りに（角丸カードを避ける方針）
- 本文の処理は `lib/richText.ts` の `prepareRichTextFragment`（サニタイズ＋埋め込み変換。目次 id は振らない）

---

## 4. ユーザーの好み・判断基準（重要）

- **角丸カードの多用は「AI感」が出る**ので避ける（ユーザーの明言）。新しい要素に背景ボックスを付けるときは注意
- 配色は **明るい「青空」基調** を維持（暗くしない）。キャッチフレーズ「超・現場主義」は改変禁止
- フォントは Noto Sans JP で統一
- **SEO（表示速度）を重視**。画像・フォントは速度優先で扱う
- 大きな変更は **元に戻せる形**（ブランチ）で行う
- 事実でない情報（費用、初回無料、締切など）は書かない
- 回答・コメントは日本語

---

## 5. ハマりどころ（作業時の注意）

- **フォルダ名を変えた後は `.next` キャッシュを削除**する（`rm -rf .next tsconfig.tsbuildinfo`）。
  残っていると Turbopack が `Next.js package not found` で落ち、全記事が 404 になる
- **ポート 3000 に古い `next dev` が残る**ことがある。`Another next dev server is already running` と出たら
  `Get-NetTCPConnection -LocalPort 3000 -State Listen` で PID を調べて停止する
- ブラウザペインが非表示だと **viewport が 0×0** になり、`getBoundingClientRect` 等の計測値が壊れる。
  `tabs_create`（foreground: true）で新しいタブを開いてから計測する。スクリーンショットは基本的に取れない
- 自動操作のブラウザでは `scroll-behavior: smooth` のスクロールが完了しない。
  アンカー遷移の検証は `document.documentElement.style.scrollBehavior = 'auto'` にしてから行う
- 検証用に `app/api/` にルートを作った場合、削除後は `.next` も削除しないと型チェックで古いルートを参照してビルドが落ちる
- App Router では `_` で始まるフォルダはルーティングされない（検証用ルートの命名に注意）
- `next/image` の `priority` は `<img>` の属性ではなく `<head>` の `<link rel="preload" imagesrcset>` として出る

---

## 6. 主要ファイル早見表

| 用途 | ファイル |
|---|---|
| サイト共通情報（屋号・住所・電話・代表者・SNS） | `lib/siteConfig.ts` |
| 事業内容の 4 領域 | `lib/services.ts` |
| 事業ごとの詳細ページ | `app/services/[id]/page.tsx` / `components/ServiceSectionBlock.tsx` / `lib/microcms.ts` の `fetchServicePage` / `types/service.ts` |
| 事業内容の一覧項目 | `components/ServiceListItem.tsx` |
| 事業内容イラストの検出 | `lib/serviceImages.ts`（置き場所 `public/services/`） |
| 配色・フォント | `tailwind.config.ts` |
| 見出し・コラム・埋め込みカードの CSS | `app/globals.css` |
| 記事本文の処理（サニタイズ・埋め込み・目次） | `lib/sanitizeHtml.ts` / `lib/richText.ts` |
| microCMS 取得 | `lib/microcms.ts` |
| 計測 | `lib/analytics/*` / `components/analytics/*` / `docs/analytics.md` |
| 全体説明 | `README.md` |

---

## 7. 更新履歴

- 2026-09-28：初版作成（上記までの作業を集約）
- 2026-09-28：事業ごとの詳細ページを追加（`feature/service-pages` ブランチ）。microCMS の API 作成はユーザー待ち
