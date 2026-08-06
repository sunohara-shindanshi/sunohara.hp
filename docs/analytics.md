# アクセス解析（GA4 + Google Tag Manager）設計・運用ドキュメント

このサイトの計測基盤の仕様書です。
**コードから GA4（gtag）へ直接送信はしません。** すべて `dataLayer` を経由し、GTM から GA4 へ送ります。

- 対象サイト: https://www.sunohara-cs.com/
- GTM コンテナ ID: 環境変数 `NEXT_PUBLIC_GTM_ID`（現在の値: `GTM-56BC4P4W`）
- GA4 測定 ID: 環境変数 `NEXT_PUBLIC_GA_ID`（現在の値: `G-VY959R184H`）

---

## 1. 全体構成

```
[各コンポーネント]
      │  useAnalytics().trackEvent('cta_click', { cta_name: 'header_contact' })
      │  もしくは data-analytics-* 属性を付けるだけ
      ▼
[AnalyticsProvider]  ← 共通パラメータ（page_path / page_location / page_title）を自動付与
      │              ← 記事コンテキスト（article_id ほか）を自動付与
      ▼
[pushToDataLayer]  →  window.dataLayer.push({ event: 'cta_click', ... })
      ▼
[Google Tag Manager]  （タグ / トリガー / 変数）
      ▼
[GA4]  （イベント + カスタムディメンション）
```

自動計測は AnalyticsProvider が担当します。

| 機能 | 実装 | 備考 |
| --- | --- | --- |
| ページビュー | `PageViewTracker` | App Router のクライアント遷移にも対応 |
| スクロール率 | `useScrollTracking` | 25/50/75/100% を各 1 回だけ |
| クリック | `useLinkTracking` | document への **イベント委譲**（1 リスナー） |
| 記事情報の付与 | `ArticleAnalytics` + `useAnalyticsPageContext` | 記事ページに 1 行置くだけ |
| フォーム | `useFormTracking` | 表示 / 入力開始 / 送信成功 |

### 設計上のポイント

- **イベント委譲**：`document` にリスナーを 1 つだけ置き、クリックされた要素をさかのぼって判定します。
  各リンクに `onClick` を書かないため、CTA やリンクが増えてもコード修正が最小限で済みます。
  さらに **microCMS のリッチエディタ本文（HTML）内のリンクも計測できます**
  （本文は React コンポーネントで包めないため、委譲以外に手段がありません）。
- **記事コンテキストは `useRef` 保持**：`useState` にすると登録のたびにページ全体が再レンダリングされるため。
- **効果（useEffect）の実行順**：`PageViewTracker` を `children` より **後ろ** に置いています。
  React は子の効果を先に実行するので、記事ページのコンテキスト登録が `page_view` の送信前に完了します。
  → `page_view` にも `article_id` などが載ります。
- **二重送信の防止**：`page_view` は送信済み URL、スクロール率は送信済みしきい値を
  **モジュールスコープ**に保持しています（コンポーネントの再マウントでも初期化されません）。

---

## 2. 追加・変更したファイル

### 新規

| ファイル | 役割 |
| --- | --- |
| `lib/analytics/events.ts` | **イベント名とパラメータ型の唯一の定義元** |
| `lib/analytics/config.ts` | 環境変数の読み出し口（GTM ID / GA4 ID / デバッグ） |
| `lib/analytics/dataLayer.ts` | `window.dataLayer.push()` の唯一の実行箇所 |
| `lib/analytics/attributes.ts` | `data-analytics-*` 属性の生成・読み取り |
| `lib/analytics/ctaNames.ts` | CTA 識別子（`cta_name`）の一覧 |
| `lib/analytics/article.ts` | 記事データ → 計測パラメータの変換 |
| `components/analytics/AnalyticsProvider.tsx` | 計測基盤のルート |
| `components/analytics/context.ts` | `useAnalytics()` / `useAnalyticsPageContext()` |
| `components/analytics/GoogleTagManager.tsx` | GTM コンテナの読み込み（+ noscript） |
| `components/analytics/PageViewTracker.tsx` | `page_view` の送信（SPA 対応） |
| `components/analytics/useScrollTracking.ts` | スクロール率の計測 |
| `components/analytics/useLinkTracking.ts` | クリックの計測（イベント委譲） |
| `components/analytics/useFormTracking.ts` | フォームの計測 |
| `components/analytics/ArticleAnalytics.tsx` | 記事ページのコンテキスト登録 |
| `components/SocialLinks.tsx` | note / X などの外部発信リンク |
| `components/TagList.tsx` | 記事タグの表示 |
| `docs/analytics.md` | このドキュメント |

### 変更

| ファイル | 変更内容 |
| --- | --- |
| `app/layout.tsx` | GTM の読み込みと `AnalyticsProvider` の設置 |
| `lib/siteConfig.ts` | `SOCIAL_LINKS`（note / X などの設定）を追加 |
| `lib/microcms.ts` | `tags` / `author` / 更新日時の取得を追加 |
| `types/blog.ts` | `Tag` 型、`tags` / `updatedAt` / `author` を追加 |
| `components/PrimaryCta.tsx` | `ctaName` / `ctaLocation` を追加（クリックを自動計測） |
| `components/Header.tsx` / `Footer.tsx` / `PageHeader.tsx` / `CtaSection.tsx` | 各 CTA・電話リンクに計測属性 |
| `components/BlogCard.tsx` | `article_select` の計測、`listName` を追加 |
| `components/PostLinkList.tsx` | `related_article_click` の計測、`listName` / `fromArticleId` を追加 |
| `components/CategoryFilter.tsx` | `category_select` の計測 |
| `components/TableOfContents.tsx` | `toc_click` の計測 |
| `components/ContactForm.tsx` | `form_view` / `form_start` / `form_submit` の計測 |
| `app/page.tsx` / `app/about/page.tsx` / `app/contact/page.tsx` / `app/blog/[id]/page.tsx` / `app/blog/(list)/page.tsx` | 各 CTA・一覧に計測情報を付与 |
| `.env.example` | GTM / GA4 / デバッグ用の環境変数 |

### 削除

| ファイル | 理由 |
| --- | --- |
| `components/GoogleAnalytics.tsx` | gtag.js の直接読み込み。**GTM と併用すると `page_view` が二重計測になる**ため廃止 |

---

## 3. イベント一覧

イベント名は `lib/analytics/events.ts` の `ANALYTICS_EVENTS` が唯一の定義元です（今後変更しません）。

| イベント名 | 発生タイミング | 実装箇所 |
| --- | --- | --- |
| `page_view` | ページ表示・クライアント遷移 | `PageViewTracker` |
| `scroll_25` / `scroll_50` / `scroll_75` / `scroll_100` | 各スクロール率に到達（各 1 回） | `useScrollTracking` |
| `cta_click` | CTA ボタン・電話・メール・SNS のクリック | data 属性 + 自動判定 |
| `related_article_click` | 記事ページ内の「おすすめ / 関連記事 / 最近の投稿」クリック | `PostLinkList` |
| `external_link_click` | 外部ドメインへのリンククリック | 自動判定 |
| `pdf_download` | `.pdf` へのリンククリック | 自動判定 |
| `article_select` | 一覧（ブログ一覧 / トップ）からの記事クリック | `BlogCard` |
| `category_select` | カテゴリ絞り込みのクリック | `CategoryFilter` |
| `tag_select` | タグのクリック | `TagList`（※後述の制限あり） |
| `form_view` | フォームが画面内に入った | `useFormTracking` |
| `form_start` | 最初の入力操作（1 回だけ） | `useFormTracking` |
| `form_submit` | 送信**成功**時 | `ContactForm` |
| `toc_click` | 記事の目次項目のクリック | `TableOfContents` |

### `toc_click`（目次クリック）

- 目次の**項目（リンク）をクリックしたときだけ**送信します。目次の開閉（`<summary>`）では送りません。
- `data-analytics-*` 属性による委譲計測のため、1 クリックにつき 1 回だけ送信されます（二重送信なし）。
- 記事情報（`article_id` / `article_slug` / `article_title` / `article_category` ほか）は
  記事ページのコンテキストから**自動で付与**されるため、コンポーネント側では指定していません。
- **GTM の設定変更は不要**です（汎用イベントタグ + `gtm.` 以外を拾うトリガーで自動的に流れます）。

---

## 4. イベントごとの送信パラメータ

### 全イベント共通（自動付与）

| パラメータ | 内容 |
| --- | --- |
| `page_path` | パス + クエリ（例: `/blog?page=2`） |
| `page_location` | 絶対 URL（**UTM パラメータを含む**） |
| `page_title` | `<title>` の内容 |

### 記事ページのみ共通（自動付与）

記事ページで発生する**すべてのイベント**（`page_view` / `scroll_*` / `cta_click` /
`related_article_click` / `toc_click` / `external_link_click` / `pdf_download` …）に自動で付きます。
値はすべて `lib/analytics/article.ts` が記事データから生成するため、
**新しい記事を追加してもコード修正は不要**です。

| パラメータ | 型 | 内容 | 生成方法 |
| --- | --- | --- | --- |
| `article_id` | 文字列 | microCMS のコンテンツ ID | そのまま |
| `article_slug` | 文字列 | 記事 URL の末尾 | 記事 URL（`/blog/{id}`）から自動取得（`lib/blogUrl.ts`） |
| `article_title` | 文字列 | 記事タイトル | そのまま |
| `article_category` | 文字列 | カテゴリ名（複数はカンマ区切り） | 参照先の `name` |
| `article_tags` | 文字列 | タグ名（複数はカンマ区切り） | 参照先の `name` |
| `publish_date` | 文字列 | 公開日 `YYYY-MM-DD` | `publishedAt` |
| `publish_year` | **数値** | 公開年（例: `2026`） | `publish_date` の先頭 4 桁 |
| `updated_date` | 文字列 | 更新日 `YYYY-MM-DD` | `revisedAt`（無ければ `updatedAt`） |
| `is_updated` | **真偽値** | 公開後に更新されたか | `updated_date > publish_date`（**同日は `false`**） |
| `word_count` | **数値** | 本文の文字数 | 本文 HTML からタグ・空白を除いた実文字数 |
| `reading_time` | **数値** | 推定読了時間（分） | `ceil(word_count / 500)`、最低 1 分 |
| `author` | 文字列 | 執筆者 | microCMS の `author`、無ければ代表者名 |

> **`article_slug` と `article_id` は現在同じ値になります。**
> 記事 URL がコンテンツ ID そのまま（`/blog/{id}`）の設計で、microCMS 側に slug フィールドは
> 設けない方針のためです。それでも別パラメータとして送っているのは、`article_slug` を
> 「URL 上の識別子」と定義しているためで、GA4 の `page_path` や Looker Studio の URL と
> そのまま突き合わせられます。URL の形を変えた場合は `lib/blogUrl.ts` の `buildBlogPostHref`
> を直すだけで、計測値も自動で追従します。

> **`word_count` / `reading_time` は記事ページのイベントのみ**に付きます。
> 一覧（`article_select`）は本文を取得しない API から作るため、この 2 つは送信されません
> （一覧の表示速度を落とさないための意図的な設計です。遷移後の `page_view` で取得できます）。

> **数値・真偽値の型について**
> `data-analytics-*` 属性の値は HTML の仕様上かならず文字列になります。そのままだと
> `page_view`（数値で push）と `article_select`（属性から復元）で型が食い違い、
> GA4 のカスタム指標が集計できなくなるため、`lib/analytics/events.ts` の
> `NUMERIC_PARAM_KEYS` / `BOOLEAN_PARAM_KEYS` に登録したキーだけ読み取り時に型を戻しています。
> 新しく数値・真偽値のパラメータを足すときは、この 2 つのリストにも追加してください。

### イベント固有

| イベント | パラメータ |
| --- | --- |
| `page_view` | `page_referrer`（初回は流入元、遷移時は直前のページ） |
| `scroll_*` | `percent_scrolled`（25 / 50 / 75 / 100） |
| `cta_click` | `cta_name`, `cta_location`, `link_url` |
| `related_article_click` | `from_article`, `to_article`, `category`, `list_name` |
| `external_link_click` | `link_url`, `link_text` |
| `pdf_download` | `file_name`, `file_url` |
| `article_select` | `article_id`, `article_slug`, `article_title`, `article_category`, `article_tags`, `publish_date`, `publish_year`, `updated_date`, `is_updated`, `list_name` |
| `category_select` | `category_name`, `category_slug`, `list_name` |
| `tag_select` | `tag_name`, `tag_slug`, `list_name` |
| `form_view` / `form_start` / `form_submit` | `form_name`, `form_id` |
| `toc_click` | `toc_text`, `toc_anchor`, `toc_level`（**数値**: 2 = H2 / 3 = H3） |

### `list_name` の値

| 値 | 場所 |
| --- | --- |
| `home_recent` | トップページの「最近のブログ」 |
| `blog_list` | ブログ一覧 |
| `recommended` | 記事ページの「おすすめの記事」 |
| `related` | 記事ページの「関連記事」 |
| `recent` | 記事ページの「最近の投稿」 |
| `blog_category_filter` | カテゴリ絞り込み |

### `cta_name` の値

`lib/analytics/ctaNames.ts` を参照（`header_contact` / `header_tel` / `hero_contact` / `hero_tel` /
`page_header_contact` / `page_header_tel` / `section_contact` / `section_tel` / `footer_contact` /
`footer_tel` / `article_header_tel` / `article_sidebar_services` / `contact_page_tel` /
`profile_contact` / `profile_note` / `profile_x`）。
`mailto:` / `tel:` リンクは、属性が無くても `cta_name = email` / `tel` として自動計測されます。

---

## 5. dataLayer へ push される内容

`{ event: <イベント名>, <共通パラメータ>, <記事パラメータ>, <イベント固有パラメータ> }` の形です。

**トップページ表示時**

```js
{
  event: 'page_view',
  page_path: '/',
  page_location: 'https://www.sunohara-cs.com/',
  page_title: '春原中小企業診断士事務所｜超・現場主義',
  article_id: undefined, article_title: undefined, /* …記事パラメータは打ち消し */
  page_referrer: 'https://note.com/...'
}
```

**記事ページで CTA をクリック**

```js
{
  event: 'cta_click',
  page_path: '/blog/xxxxxxx',
  page_location: 'https://www.sunohara-cs.com/blog/xxxxxxx',
  page_title: '記事タイトル｜春原中小企業診断士事務所',
  article_id: 'xxxxxxx',
  article_slug: 'xxxxxxx',
  article_title: '記事タイトル',
  article_category: '財務・資金',
  article_tags: '資金繰り,補助金',
  publish_date: '2026-04-01',
  publish_year: 2026,
  updated_date: '2026-05-12',
  is_updated: true,
  word_count: 3850,
  reading_time: 8,
  author: '春原 功貴',
  cta_name: 'section_contact',
  cta_location: 'section',
  link_url: '/contact'
}
```

**目次をクリック**（記事パラメータは上と同じものが自動で付く。以下は固有分のみ）

```js
{
  event: 'toc_click',
  toc_text: '金融機関が見ているポイント',
  toc_anchor: '#heading-3',
  toc_level: 2
}
```

> **記事パラメータの打ち消しについて**
> dataLayer の値は push をまたいで保持されるため、記事ページを見た後に他ページのイベントを送ると
> 古い `article_id` が残ってしまいます。これを避けるため、記事ページ以外では
> 記事パラメータを `undefined` で明示的に上書きしています。
> GTM の変数には**既定値を「空」**に設定してください。

**ページ読み込み直後（GTM 本体より先）**

```js
{ ga_measurement_id: 'G-VY959R184H' }
```

---

## 6. GA4 で登録するカスタムディメンション

管理 → データの表示 → **カスタム定義** → カスタムディメンションを作成。
範囲はすべて **イベント** です。

> **登録するのは「実際にレポートで使うもの」だけにします。**
> GA4 は固有値の多い（カーディナリティの高い）ディメンションを登録すると、
> 標準レポートで行がまとめられて `(other)` になり、**他のディメンションの精度まで巻き添えで落ちます**。
> 送信しているパラメータをすべて登録する必要はありません（詳しくは後述）。

### 登録する（9 個）

| # | ディメンション名 | パラメータ | 値の種類（目安） | 用途 |
| --- | --- | --- | --- | --- |
| 1 | 記事ID | `article_id` | 記事数 | **記事ごとの分析の軸**。一覧クリック・回遊で「どの記事か」を特定する |
| 2 | 記事カテゴリ | `article_category` | 8 | カテゴリ別のパフォーマンス |
| 3 | 公開年 | `publish_year` | 数個 | 記事の鮮度分析（リライト優先順位） |
| 4 | 更新有無 | `is_updated` | 2 | リライト済み／未リライトの比較 |
| 5 | CTA名 | `cta_name` | 16 | どのボタンが効くか |
| 6 | CTA設置場所 | `cta_location` | 7 | 設置場所別の効果 |
| 7 | リスト名 | `list_name` | 6 | どの一覧・欄からの遷移か |
| 8 | 遷移先記事 | `to_article` | 記事数 | 回遊先（関連記事・おすすめの効果） |
| 9 | カテゴリ名 | `category_name` | 9 | カテゴリ絞り込みのクリック |

**カスタム指標（1 個）**（範囲＝イベント、単位＝標準）

| 指標名 | パラメータ | 用途 |
| --- | --- | --- |
| 記事文字数 | `word_count` | 文字数と読了率の相関 |

> GA4 のカスタム指標は合計されます。文字数の合計に意味はないので、
> Looker Studio で `SUM(word_count) ÷ page_view 数` の計算フィールドを作り、**平均**で見てください。
> `reading_time` は `word_count ÷ 500` で再現できるため、指標として別登録する必要はありません。

### 登録しない（理由つき）

**A. GA4 の組み込みディメンションで代替できる**

| パラメータ | 代替 |
| --- | --- |
| `article_slug` | 組み込み「ページパス + クエリ文字列」と同じ値（`/blog/{id}`） |
| `article_title` | 組み込み「ページタイトル」。記事ページで発生したイベントには記事タイトルが入る |
| `from_article` | 組み込み「ページパス」。回遊イベントは**遷移元のページで発生する**ため、発生ページ＝遷移元 |
| `page_path` / `page_location` / `page_title` / `page_referrer` | すべて組み込みディメンションがある |

**B. 値が実質的に無限に増える（最も避けるべきもの）**

| パラメータ | 理由 |
| --- | --- |
| `link_url` / `link_text` | 外部リンクは記事が増えるほど際限なく増える。Google が名指しで避けるよう例示している種類 |
| `file_url` | 同上 |
| `toc_text` | 記事数 × 見出し数。数百記事なら数千種類になりうる |

**C. 情報が重複している／粒度が細かすぎる**

| パラメータ | 理由 |
| --- | --- |
| `publish_date` | `publish_year` で足りる。日単位はほぼ記事数と同じ固有値数になる |
| `updated_date` | `is_updated` で足りる |
| `reading_time` | `word_count` から計算できる |
| `toc_anchor` | `#heading-0`〜 の連番で、記事をまたぐと意味が重複する |
| `category_slug` | `category_name` で足りる |
| `percent_scrolled` | イベント名（`scroll_25`〜`scroll_100`）で判別できる |
| `toc_level` | H2 / H3 の 2 値。必要になってから |
| `category` | 関連記事の遷移先カテゴリ。`article_category` との違いを使う場面が来てから |

**D. まだ運用していない（始めたら登録する）**

`article_tags` / `tag_name`（タグ未運用）、`file_name`（PDF 未公開）、`author`（執筆者 1 名）、
`form_name` / `form_id`（フォーム 1 つ。イベント名で判別できる）

### カーディナリティの考え方

- 問題になるのは **1 日あたりの固有値の数**です。記事が数百件あっても、
  1 日に閲覧される記事は限られるため、`article_id` は実務上ほぼ問題になりません。
- 本当に危険なのは **値が原理的に無限になるもの**（外部リンク URL、リンクテキスト、
  見出しテキストなど）。上の B に該当するものは登録しないでください。
- 迷ったら **登録しない**のが安全です。**パラメータは登録しなくても送信され続けます**。
  ただし後から登録した場合、**適用されるのは登録日以降のデータだけ**（過去分には遡りません）。
- どうしても全パラメータを分析したくなったら、**BigQuery エクスポート**（GA4 の無料枠あり）を
  有効にすると、カスタムディメンションを登録していないパラメータも SQL で扱えます。

### この 9 個で分析できること

| 知りたいこと | 使うディメンション |
| --- | --- |
| どの記事が読まれているか | 組み込み「ページパス」／「ページタイトル」 |
| 記事ごとの読了率 | ページパス × イベント名（`scroll_100` ÷ `page_view`） |
| 記事ごとの CTA クリック率 | ページパス × `cta_name` |
| どのボタン・どの位置が効くか | `cta_name` × `cta_location` |
| リライトの効果 | `is_updated` |
| 古い記事がまだ集客しているか | `publish_year` |
| 関連記事・おすすめが機能しているか | `list_name` × `to_article` |
| 一覧のどこから記事に入ったか | `list_name` × `article_id` |
| カテゴリ絞り込みの利用状況 | `category_name` |
| 記事の長さと読了率の関係 | `word_count`（指標） |

### キーイベント（旧コンバージョン）

管理 → イベント → 「キーイベントとしてマークを付ける」で以下を設定します。

- `form_submit`（問い合わせ送信完了）
- `cta_click`（必要に応じて。多すぎる場合は GA4 の「イベントを作成」で
  `cta_name` が `*_contact` のものだけを別イベントにしてからマークするのが確実です）

---

## 7. GTM で作成するタグ

| # | タグ名 | 種類 | 設定 | トリガー |
| --- | --- | --- | --- | --- |
| 1 | `GA4 - 設定（Google タグ）` | Google タグ | タグ ID: `{{DLV - ga_measurement_id}}`／設定パラメータに **`send_page_view` = `false`** | 初期化 - All Pages |
| 2 | `GA4 - イベント（汎用）` | GA4 イベント | 測定 ID: タグ 1 を参照／イベント名: **`{{Event}}`**／イベントパラメータ: 下記すべて | 3. カスタムイベント（汎用） |

**タグ 2 のイベントパラメータ**（左＝パラメータ名、右＝変数）

```
page_path         {{DLV - page_path}}
page_location     {{DLV - page_location}}
page_title        {{DLV - page_title}}
page_referrer     {{DLV - page_referrer}}
article_id        {{DLV - article_id}}
article_slug      {{DLV - article_slug}}
article_title     {{DLV - article_title}}
article_category  {{DLV - article_category}}
article_tags      {{DLV - article_tags}}
publish_date      {{DLV - publish_date}}
publish_year      {{DLV - publish_year}}
updated_date      {{DLV - updated_date}}
is_updated        {{DLV - is_updated}}
word_count        {{DLV - word_count}}
reading_time      {{DLV - reading_time}}
author            {{DLV - author}}
toc_text          {{DLV - toc_text}}
toc_anchor        {{DLV - toc_anchor}}
toc_level         {{DLV - toc_level}}
cta_name          {{DLV - cta_name}}
cta_location      {{DLV - cta_location}}
link_url          {{DLV - link_url}}
link_text         {{DLV - link_text}}
from_article      {{DLV - from_article}}
to_article        {{DLV - to_article}}
category          {{DLV - category}}
file_name         {{DLV - file_name}}
file_url          {{DLV - file_url}}
list_name         {{DLV - list_name}}
category_name     {{DLV - category_name}}
category_slug     {{DLV - category_slug}}
tag_name          {{DLV - tag_name}}
tag_slug          {{DLV - tag_slug}}
form_name         {{DLV - form_name}}
form_id           {{DLV - form_id}}
percent_scrolled  {{DLV - percent_scrolled}}
```

値が空の変数は GA4 に送信されないため、全イベントで同じ設定を使い回せます。
**タグはこの 2 つだけ**です。新しいイベントを追加してもタグの追加は不要です。

> **なぜイベントを増やしても GTM の変更が要らないのか**
> - タグのイベント名を `{{Event}}`（dataLayer の `event` の値そのもの）にしているため、
>   どんなイベント名でもそのまま GA4 のイベント名になります。
> - トリガーを「`gtm.` で始まらないカスタムイベントすべて」にしているため、
>   新しいイベント名を条件に足す必要がありません。
> - パラメータは値が空なら送信されないため、全イベントで同じパラメータ表を使い回せます。
>
> したがって **GTM 側の作業が発生するのは「新しいパラメータを増やしたとき」だけ**で、
> そのときも「変数を 1 つ作る」「タグのパラメータ表に 1 行足す」の 2 手で済みます。
> `toc_click` の追加のように、既存パラメータだけで完結するイベントなら **GTM は一切さわりません**。

> ⚠ **重要（二重計測の防止）**
> - タグ 1 の `send_page_view` は必ず `false` にしてください。`page_view` はコード側から送ります。
> - GA4 管理画面の「拡張計測機能」で、**ページビュー数**（履歴イベントに基づくページ変更）と
>   **スクロール数**、**離脱クリック**、**ファイルのダウンロード**は **オフ** にしてください。
>   いずれも本実装で送信しているため、有効のままだと二重計測になります。

---

## 8. GTM で作成するトリガー

| # | トリガー名 | 種類 | 条件 |
| --- | --- | --- | --- |
| 1 | `初期化 - All Pages` | 初期化 | すべての初期化イベント |
| 2 | （未使用） | – | – |
| 3 | `カスタムイベント（汎用）` | カスタムイベント | イベント名: `.*`／**正規表現一致にチェック**／条件: `Event` **が正規表現に一致しない** `^gtm\.` |

トリガー 3 は「GTM 内部のイベント（`gtm.js` / `gtm.dom` / `gtm.load` など）以外のすべて」を意味します。
この形にしておくと、**イベントを追加しても GTM 側の設定変更が不要**です。

厳密に列挙したい場合は、代わりに次の正規表現を使ってください（この場合はイベント追加のたびに更新が必要）。

```
^(page_view|scroll_25|scroll_50|scroll_75|scroll_100|cta_click|related_article_click|external_link_click|pdf_download|article_select|category_select|tag_select|form_view|form_start|form_submit)$
```

---

## 9. GTM で作成する変数

### 組み込み変数

「変数」→「設定」から **Event**（`{{Event}}`）を有効化します。

### ユーザー定義変数

すべて **データレイヤーの変数**（バージョン 2、データレイヤーのバージョン: 2）で作成します。
命名は `DLV - <パラメータ名>` に統一してください。

```
DLV - ga_measurement_id
DLV - page_path            DLV - page_location        DLV - page_title
DLV - page_referrer        DLV - percent_scrolled
DLV - article_id           DLV - article_slug         DLV - article_title
DLV - article_category     DLV - article_tags
DLV - publish_date         DLV - publish_year         DLV - updated_date
DLV - is_updated           DLV - word_count           DLV - reading_time
DLV - author
DLV - toc_text             DLV - toc_anchor           DLV - toc_level
DLV - cta_name             DLV - cta_location         DLV - link_url
DLV - link_text
DLV - from_article         DLV - to_article           DLV - category
DLV - file_name            DLV - file_url
DLV - list_name            DLV - category_name        DLV - category_slug
DLV - tag_name             DLV - tag_slug
DLV - form_name            DLV - form_id
```

**既定値は設定しない**でください（空のまま）。値が無いパラメータを GA4 へ送らないためです。

> **カスタムディメンションに登録しないパラメータも、変数は作って送信します。**
> 送信さえしていれば DebugView と BigQuery で確認でき、必要になった時点で
> カスタムディメンションに登録すれば（その日以降のデータから）レポートで使えるようになります。
> 逆に送っていないものは、後から遡って取ることができません。
>
> ※ GA4 の制限として **1 イベントあたりのパラメータは 25 個まで**です。
> 現在は最も多いイベント（記事ページの `related_article_click`）でも 20 個弱なので余裕がありますが、
> 記事パラメータを増やすときはこの上限に注意してください。

---

## 10. 動作確認方法

### A. ローカルで dataLayer の中身を見る

`.env.local` に一時的に次を追加して `npm run dev` を実行します。

```
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

ブラウザの開発者ツール → Console に `[analytics] { event: 'page_view', ... }` が出力されます。
`window.dataLayer` を直接確認することもできます。

**確認内容**

1. ページを開く → `page_view` が **1 回だけ** 出る
2. 別ページへ移動 → `page_view` がもう 1 回出る（`page_path` が変わっている）
3. 下までスクロール → `scroll_25` → `scroll_50` → `scroll_75` → `scroll_100` が各 1 回
4. 同じ位置へ戻って再度スクロール → **何も出ない**（重複送信されない）
5. 記事ページで CTA をクリック → `cta_click` に `article_id` などが載っている
6. お問い合わせページ → `form_view` → 入力 → `form_start`（1 回だけ）→ 送信成功 → `form_submit`

確認後は `NEXT_PUBLIC_ANALYTICS_DEBUG` の行を必ず削除してください。

### B. GTM プレビューモード

1. GTM 管理画面 → 右上「プレビュー」
2. URL に `https://www.sunohara-cs.com/` を入力して接続
3. 左側のイベント一覧に `page_view` / `scroll_25` / `cta_click` などが並ぶことを確認
4. 各イベントをクリック → 「Variables」タブで `DLV - article_id` などに値が入っているか確認
5. 「Tags」タブで `GA4 - イベント（汎用）` が **Fired** になっているか確認

### C. GA4 リアルタイム / DebugView

- GA4 → レポート → **リアルタイム**：イベント名が表示される
- GA4 → 管理 → **DebugView**：GTM プレビュー中のイベントとパラメータが 1 件ずつ確認できる
  （パラメータの中身まで見えるのでこちらが確実です）

### D. 本番反映の確認

```bash
npm run build && npm run start
```

ページのソースに `googletagmanager.com/gtm.js?id=GTM-...` が含まれていることを確認します。

---

## 11. 保守・運用方法

### 日常の運用（コード修正が不要なもの）

| やること | 必要な作業 |
| --- | --- |
| ブログ記事を追加 | microCMS で公開するだけ。記事情報は自動で計測されます |
| カテゴリを追加 | microCMS で追加するだけ |
| タグを追加 | microCMS で追加するだけ（`article_tags` に自動で載ります） |
| 記事内に外部リンク・PDF を貼る | microCMS の本文に貼るだけ。自動で計測されます |

### コードを 1 行だけ変えるもの

| やること | 作業 |
| --- | --- |
| CTA ボタンを追加 | `lib/analytics/ctaNames.ts` に識別子を 1 行足し、ボタンに `{...analyticsAttributes('cta_click', { cta_name: CTA_NAMES.XXX })}` を付ける |
| SNS を追加（note / X など） | `lib/siteConfig.ts` の `SOCIAL_LINKS` に 1 件足す（URL を入れると表示・計測とも有効化） |
| GTM / GA4 の ID を変更 | `.env.local` の `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA_ID` を書き換えて再ビルド |

### 触ってはいけないもの

- `lib/analytics/events.ts` の **イベント名の文字列**（GA4 の過去データと接続が切れます）
- GTM のタグ 1 の `send_page_view = false`
- GA4 拡張計測機能の「ページビュー数 / スクロール数 / 離脱クリック / ファイルのダウンロード」＝ **オフのまま**

### UTM パラメータ

GA4 が `page_location` から自動的に読み取るため、追加設定は不要です。
外部発信では次の形式で統一してください。

| 媒体 | URL 例 |
| --- | --- |
| note | `https://www.sunohara-cs.com/blog/xxxx?utm_source=note&utm_medium=article&utm_campaign=<記事スラッグ>` |
| X | `https://www.sunohara-cs.com/blog/xxxx?utm_source=x&utm_medium=social&utm_campaign=<記事スラッグ>` |

GA4 →「集客」→「トラフィック獲得」で `セッションの参照元 / メディア`、`セッションのキャンペーン` として分析できます。

---

## 12. イベントを追加する手順

例：資料請求ボタンのクリックを `download_document` として計測する場合。

1. **イベント名を定義**
   `lib/analytics/events.ts` の `ANALYTICS_EVENTS` に追加します。
   ```ts
   DOWNLOAD_DOCUMENT: 'download_document',
   ```
2. **パラメータの型を定義**
   同ファイルの `AnalyticsEventParamsMap` に追加します。
   ```ts
   download_document: { document_name: string; document_url?: string };
   ```
3. **送信箇所を書く**
   - リンク・ボタンなら data 属性だけ：
     ```tsx
     <a href={url} {...analyticsAttributes('download_document', { document_name: '会社案内' })}>
     ```
   - それ以外のタイミングなら hook：
     ```tsx
     const { trackEvent } = useAnalytics();
     trackEvent('download_document', { document_name: '会社案内' });
     ```
4. **数値・真偽値なら型のリストに登録**（`data-analytics-*` 属性で送る場合のみ）
   `lib/analytics/events.ts` の `NUMERIC_PARAM_KEYS` / `BOOLEAN_PARAM_KEYS` に名前を足します。
   これを忘れると、属性経由のときだけ文字列として送信されます。
5. **GA4 でカスタムディメンションを登録**（新しいパラメータがある場合のみ）
   管理 → カスタム定義 → `document_name` を登録します。
6. **GTM のタグ 2 にパラメータ行を追加**（新しいパラメータがある場合のみ）
   `document_name` → `{{DLV - document_name}}` を追加し、変数も作成します。

> トリガーは「`gtm.` 以外のすべて」にしているため、**トリガーの修正は不要**です。
> 新しいパラメータを増やさない場合、GTM 側の作業は **ゼロ** です。

---

## 13. Looker Studio での分析例

GA4 をデータソースに接続して使います。
**記事の識別は、カスタムディメンションではなく組み込みの「ページパス + クエリ文字列」を軸**にします
（`/blog/{id}` がそのまま記事の識別子になるため）。記事名は組み込みの「ページタイトル」で読めます。
カスタムディメンションは、そこに**属性を足す**ために使います。

### ① 記事別パフォーマンス表（基本形）

| 項目 | 設定 |
| --- | --- |
| ディメンション | ページパス + クエリ文字列（＋ページタイトルを並べる） |
| フィルタ | ページパスに `/blog/` を含む |
| 指標 | イベント数（`page_view`）、`cta_click` 数、`scroll_100` 数 |
| 計算フィールド | 読了率 = `scroll_100` 数 ÷ `page_view` 数 |
| 計算フィールド | CTA 率 = `cta_click` 数 ÷ `page_view` 数 |

→ 「読まれているのに CTA が押されない記事」＝ **CTA の文言・位置を見直す候補**が特定できます。

### ② リライト効果の測定

| 項目 | 設定 |
| --- | --- |
| ディメンション | `is_updated`（true / false） |
| 指標 | `page_view` 数、平均 `scroll_100` 到達率、`cta_click` 率 |

→ リライト済み記事と未リライト記事の成果差が出ます。
更新の前後で比較したい場合は、`updated_date`（未登録）ではなく
**レポートの期間指定**で「更新日の前 30 日」と「後 30 日」を比べてください。

### ③ 記事の長さと読了率の相関

| 項目 | 設定 |
| --- | --- |
| グラフ | 散布図 |
| 単位（点） | ページパス + クエリ文字列 |
| X 軸 | 平均文字数 = `SUM(word_count) ÷ page_view 数`（計算フィールド） |
| Y 軸 | 読了率（`scroll_100` ÷ `page_view`） |
| バブルの大きさ | `page_view` 数 |

→ **このサイトにとって最適な記事の長さ**が見えます（例：3,000 字を超えると読了率が落ちる、など）。
読了時間で表現したい場合は、計算フィールドで `平均文字数 ÷ 500` を作れば
`reading_time` を登録しなくても同じ軸が得られます。

### ④ 記事の鮮度分析

| 項目 | 設定 |
| --- | --- |
| ディメンション | `publish_year` |
| 指標 | `page_view` 数、`cta_click` 率 |

→ 古い記事がまだ集客しているかが分かり、**リライト優先順位**の根拠になります。
`publish_year` × `article_category` のクロス集計にすると、カテゴリごとの寿命が見えます。

### ⑤ 関連記事・おすすめの効果

| 項目 | 設定 |
| --- | --- |
| ディメンション | `list_name`（recommended / related / recent）、`to_article` |
| 指標 | `related_article_click` 数 |
| フィルタ | イベント名 = `related_article_click` |

→ **手動で選んだ「おすすめの記事」が、自動の「関連記事」より効いているか**が分かります。
`to_article` を並べれば、どの記事が回遊先として強いかも見えます。

### ⑥ 目次クリックから読者の関心を読む（要追加登録）

| 項目 | 設定 |
| --- | --- |
| ディメンション | ページパス + クエリ文字列、`toc_text` |
| 指標 | `toc_click` 数 |
| フィルタ | イベント名 = `toc_click` |

→ 記事内で**どの見出しが最も求められているか**が分かります。
クリックが集中する見出しは、独立記事に切り出す・記事の冒頭へ移動する、といった改善につながります。

> ⚠ このレポートには `toc_text` のカスタムディメンション登録が必要ですが、
> `toc_text` は**固有値が非常に多い**（記事数 × 見出し数）ため、既定では登録しない方針にしています。
> 目次分析を本格的に行いたくなったタイミングで登録するか、BigQuery エクスポートで分析してください。
> データ自体は登録の有無にかかわらず送信され続けています。

### ⑦ 流入元（UTM）× 記事の掛け合わせ

| 項目 | 設定 |
| --- | --- |
| ディメンション | セッションの参照元/メディア、ページパス + クエリ文字列 |
| 指標 | `page_view` 数、`cta_click` 率 |

→ note 経由と X 経由で、成果の出る記事が違うかどうかが分かります。

---

## 14. 既知の制限・今後の検討事項

- **タグ別の一覧ページが未実装**：`tag_select` は `TagList` に `getHref` を渡したときに発火します。
  現在はタグのアーカイブページが無いためリンクにしておらず、このイベントは発生しません。
  タグ一覧ページを作った際に `getHref` を渡せば計測まで有効になります。
- **`tags` / `author` フィールド**：microCMS 側に作成すると `article_tags` / `author` が
  自動で送信され始めます。未作成の間は該当パラメータが送信されないだけで、
  他の計測に影響はありません。
- **`article_slug` はコンテンツ ID と同じ値**です（記事 URL から取得しているため）。
  microCMS に slug フィールドは設けない方針のため、値が途中で変わることはありません。
- **`word_count` / `reading_time` は記事ページのイベントのみ**に付きます。一覧クリック
  （`article_select`）には含まれません（本文を取得しない API から作っているため）。
- **Cookie 同意（Consent Mode）は未実装**：日本国内向けのみであれば必須ではありませんが、
  EU 圏からのアクセスも計測対象にする場合は同意管理の追加が必要です。
- **`page_title`** は送信時点の `document.title` を読みます。クライアント遷移では
  タイトル更新後に送信されますが、まれにずれる可能性があるため、
  ページ名の分析は `page_path` を主に使うことを推奨します。
