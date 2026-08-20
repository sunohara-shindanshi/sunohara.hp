# 春原中小企業診断士事務所 コーポレートサイト

「超・現場主義」を掲げる春原中小企業診断士事務所のコーポレートサイト（Next.js App Router / TypeScript）です。

- 屋号：春原中小企業診断士事務所
- キャッチフレーズ：超・現場主義
- 所在地：東京都葛飾区奥戸3-20-1
- 電話番号：**非掲載**（問い合わせはフォームに集約。`lib/siteConfig.ts` の `tel` が `null`）

上記の固定情報は `lib/siteConfig.ts` に集約しており、各ページ・フッター・構造化データはすべてこの定数を参照しています。**表記を変更する場合は `lib/siteConfig.ts` だけを編集してください。**

### 電話番号の掲載／非掲載

`lib/siteConfig.ts` の `tel` が **唯一のスイッチ**です。

| `tel` の値 | サイトの表示 |
|---|---|
| `null`（現在） | ヘッダー・フッター・CTA 帯・ファーストビュー・事務所概要・構造化データから電話導線が消え、フォームへの案内文に切り替わります |
| `'080-xxxx-xxxx'` | 上記すべての箇所に電話番号が復活します |

分岐は各コンポーネントに実装済みのため、**再掲載する場合はこの 1 行に番号を入れて再ビルドするだけ**です。

---

## 1. 技術スタック

| 項目 | 採用しているもの |
|---|---|
| フレームワーク | Next.js（App Router、`app/` ディレクトリ） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS（`tailwind.config.ts` の `theme.extend` でブランドカラー・フォントを定義）＋ `@tailwindcss/typography`（ブログ本文用） |
| HTML サニタイズ | `sanitize-html`（microCMS のリッチエディタ本文を許可タグのみに制限） |
| メール送信 | `resend`（お問い合わせフォームの通知メール） |
| フォント | サイト全体を Noto Sans JP に統一（`next/font/google`・可変フォント）。見出し・本文・キャッチフレーズすべて同じ書体 |
| 画像 | `next/image`（外部画像ドメインは `next.config.ts` の `images.remotePatterns` で許可） |
| Lint | ESLint（`eslint-config-next`） |

- パッケージのバージョンは**プロジェクト作成時点の最新安定版**を `npm install` で解決した結果を `package.json` に記録しています。特定バージョンへの固定は行っていません。
- Tailwind CSS は、本仕様が求める `tailwind.config.ts` での `theme.extend` 管理に合わせて **v3 系**を採用しています（v4 系は CSS ファイル内で設定する方式のため）。

---

## 2. セットアップ

前提：Node.js（LTS 版）と npm が利用できること。

```bash
npm install
```

環境変数のひな形をコピーします。

```bash
cp .env.example .env.local
```

> Windows PowerShell の場合は `Copy-Item .env.example .env.local`

`.env.local` に実際の値を記入したうえで、開発サーバーを起動します。

```bash
npm run dev
```

`http://localhost:3000` で表示されます。

### その他のコマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーの起動 |
| `npm run build` | 本番ビルド（型チェックを含む） |
| `npm run start` | ビルド済みアプリの起動 |
| `npm run lint` | ESLint の実行 |

---

## 3. 環境変数

実値は `.env.local`（Git 管理対象外／`.gitignore` 済み）に記述してください。`.env.example` にはプレースホルダーのみを置き、実値は絶対にコミットしないでください。

| 変数名 | 必須 | 用途 |
|---|---|---|
| `MICROCMS_SERVICE_DOMAIN` | ブログ利用時 | microCMS のサービスドメイン（`https://xxxx.microcms.io` の `xxxx` 部分） |
| `MICROCMS_API_KEY` | ブログ利用時 | microCMS の API キー（**サーバー側のみで使用する秘匿値**） |
| `MICROCMS_BLOG_ENDPOINT` | ブログ利用時 | ブログ記事 API のエンドポイント名（設定仕様書の想定値：`blogs`） |
| `MICROCMS_CATEGORY_ENDPOINT` | 任意 | カテゴリ API のエンドポイント名（設定仕様書の想定値：`categories`）。未設定でも記事一覧は表示できるが、カテゴリ絞り込みは表示されない |
| `RESEND_API_KEY` | フォーム利用時 | メール送信サービス [Resend](https://resend.com) の API キー（**サーバー側のみで使用する秘匿値**） |
| `CONTACT_FROM_EMAIL` | フォーム利用時 | 通知メールの送信元アドレス（Resend で検証済みドメインのアドレス。テストは `onboarding@resend.dev`） |
| `CONTACT_TO_EMAIL` | 任意 | 通知先（届け先）アドレス。未設定なら `lib/siteConfig.ts` の `contactEmail`（`sunohara.shindanshi@gmail.com`）に届く。**宛先変更はこの 1 行だけ** |

いずれも `NEXT_PUBLIC_` を付けていません。**API キー等の秘匿値に `NEXT_PUBLIC_` を付けるとブラウザに露出するため、付けないでください。**

補足：`MICROCMS_SERVICE_DOMAIN` と各エンドポイント名は「名前だけ」を設定するのが正しい形ですが（例：`your-service` / `blogs`）、管理画面の API プレビュー URL をそのまま貼り付けた場合（`https://xxxx.microcms.io/api/v1/blogs`）でも動くよう、`lib/microcms.ts` 側で名前部分を取り出す正規化を入れています。

---

## 4. 差し替えが必要な箇所（プレースホルダー一覧）

| 箇所 | ファイル | 内容 |
|---|---|---|
| 本番ドメイン | `lib/siteConfig.ts` の `SITE_URL` | 仮で `https://example.com`。canonical・OGP・`sitemap.xml`・`robots.txt` がこの定数を参照しているため、**ここ 1 箇所を書き換えるだけで全体に反映されます。** |
| 代表者氏名 | `lib/siteConfig.ts` の `representative.name` | 仮で `春原 〇〇`。正式な氏名に差し替えてください（基本情報ページの概要表と代表者挨拶の署名に反映されます）。 |
| 代表者肩書 | `lib/siteConfig.ts` の `representative.title` | 仮で `代表 / 中小企業診断士`。 |
| 代表者の顔写真 | `lib/siteConfig.ts` の `representative.image` | 現在 `null`（基本情報ページの代表者挨拶にプレースホルダーを表示）。`public/` に画像を置き、そのパス（例：`/representative.webp`）を設定すると表示されます。**元が JPEG / PNG でも `next/image` が WebP に変換して配信するため、拡張子は問いません。** |
| 代表者挨拶の本文 | `app/about/page.tsx` | 事務所の姿勢にもとづく文面を仮で記載しています。ご本人の言葉に差し替え／加筆してください（経歴・資格取得年などの事実は記載していません）。 |
| microCMS 接続情報 | `.env.local` | 未設定の場合、`/blog` は「接続設定が未完了です」と表示します（架空の記事は表示しません）。 |
| microCMS の画像ドメイン | `next.config.ts` | `images.microcms-assets.io` を許可しています。実際の配信ホスト名が異なる場合は修正してください。 |
| 1ページあたりの記事数 | `lib/microcms.ts` の `BLOG_PAGE_SIZE` | 現在 9 件（3列 × 3行）。 |
| フォームの通知先メール | `.env.local` の `CONTACT_TO_EMAIL`（既定は `lib/siteConfig.ts` の `contactEmail`） | 問い合わせ内容の届け先。既定は `sunohara.shindanshi@gmail.com`。変更はこの 1 行のみ |
| メール送信の設定 | `.env.local` の `RESEND_API_KEY` / `CONTACT_FROM_EMAIL` | Resend の API キーと送信元アドレス。未設定の間は、フォームは成功表示をせずエラーを表示します（「6. お問い合わせフォーム」参照） |
| OGP 画像 | 未設定 | 画像素材が未確定のため、`openGraph.images` は設定していません。画像を用意したら `public/` に配置し、`lib/metadata.ts` の `openGraph` に `images` を追加してください。 |
| 事業内容の補足文 | `lib/services.ts` の `detail` | 4 領域（財務・資金／組織・人事／営業・売上／IT・システム）の名称・サブタイトル・支援メニュー（`points`）は指定どおりです。`detail`（事業内容ページの説明文）は暫定のため、実際の支援内容に合わせて調整してください。 |

---

## 5. サイト構成

| ページ | ルート | ファイル |
|---|---|---|
| トップページ | `/` | `app/page.tsx` |
| 事業内容 | `/services` | `app/services/page.tsx` |
| 基本情報（代表者挨拶を含む） | `/about` | `app/about/page.tsx` |
| ブログ一覧 | `/blog` | `app/blog/(list)/page.tsx` |
| ブログ記事詳細 | `/blog/{記事ID}` | `app/blog/[id]/page.tsx` |
| お問い合わせ | `/contact` | `app/contact/page.tsx` |

`(list)` は URL に影響しないルートグループです（`/blog` のまま）。読み込み中表示（`loading.tsx`）を一覧ページだけに適用し、記事詳細ページの HTML に一覧のスケルトンが混入しないようにするために使っています。

トップページの構成は、ファーストビュー（屋号・キャッチフレーズ）→ **最近のブログ（3 件 ＋「もっと見る」でブログ一覧へ）** → 事業内容 → 支援の進め方 → お問い合わせ導線、の順です。記事が 0 件のとき、または microCMS が未設定・障害中のときは、最近のブログのセクションごと非表示になります（トップページの表示は止まりません）。

共通ヘッダー・フッターは `app/layout.tsx` から `components/Header.tsx` / `components/Footer.tsx` を読み込んでいます。ナビゲーションの項目は `lib/siteConfig.ts` の `NAV_ITEMS` が唯一の定義元で、ヘッダー・フッター・`app/sitemap.ts` がこれを共有しています。

URL の末尾スラッシュは「付けない」で統一しています（`next.config.ts` の `trailingSlash: false`）。

### ディレクトリ構成

```
app/
  layout.tsx          共通レイアウト（フォント読み込み・Metadata の template）
  page.tsx            トップページ（ProfessionalService の JSON-LD を出力）
  services/page.tsx
  about/page.tsx
  blog/(list)/page.tsx     記事一覧（Server Component で microCMS から取得）
  blog/(list)/loading.tsx  一覧の読み込み中
  blog/[id]/page.tsx       記事詳細（本文・関連記事・最近の投稿）
  blog/queries.ts          ページ番号・カテゴリの解決（page.tsx と generateMetadata で共用）
  blog/error.tsx           API エラー時（Client Component。一覧・詳細の両方をカバー）
  contact/page.tsx
  contact/actions.ts  お問い合わせの Server Action
  not-found.tsx       404
  robots.ts           /robots.txt
  sitemap.ts          /sitemap.xml
  icon.svg            ファビコン
  globals.css
components/           共通 UI（Header / Footer / BrandMotif / CategoryFilter / Pagination /
                      BlogCard / PostLinkList / RichText / TableOfContents / JsonLd ほか）
lib/                  siteConfig / services / metadata / microcms / blogUrl /
                      richText（目次生成）/ sanitizeHtml / formatDate
types/                blog / contact の型定義
public/               静的アセット（現在は空）
```

---

## 6. お問い合わせフォーム

- **送信方式：Server Action**（`app/contact/actions.ts` の `submitContactForm`）を採用しています。Route Handler（`app/api/contact/route.ts`）は使用していません。
- 入力項目：お名前（必須）／会社名・屋号／メールアドレス（必須）／電話番号／ご相談内容（セレクト）／お問い合わせ内容（必須・複数行）
- 「ご相談内容」の選択肢は `lib/services.ts` の `CONTACT_SUBJECTS` から生成しており、事業内容の 4 領域と順序・名称が常に一致します。
- バリデーションはクライアント側（`required` / `type` / `maxLength`）とサーバー側（Server Action 内）の両方で実施しています。サーバー側では空文字・メール形式・選択肢の妥当性・文字数上限を検証します。

### メール通知（Resend）

- 送信内容は [Resend](https://resend.com) で**通知メール**として届きます（`app/contact/actions.ts` → `lib/contactEmail.ts`）。
- **宛先**：`CONTACT_TO_EMAIL`（未設定なら `lib/siteConfig.ts` の `contactEmail` ＝ `sunohara.shindanshi@gmail.com`）。**アドレスが変わったら、この環境変数を書き換えるだけ**です。
- 通知メールの**返信先（Reply-To）は問い合わせ者のメールアドレス**にしているため、届いたメールにそのまま返信すればお客様へ返信できます。
- 件名は「【お問い合わせ】{ご相談内容} - {お名前}様」。本文はテキスト版と HTML 版の両方を送ります。
- **セキュリティ**：HTML メールに埋め込むユーザー入力は `lib/contactEmail.ts` の `escapeHtml` で必ずエスケープしています（`<script>` などが実行される HTML インジェクションを防止）。
- **設定手順**（初回のみ）
  1. [Resend](https://resend.com) に登録し、API キーを発行 → `.env.local` の `RESEND_API_KEY` に設定。
  2. 送信元アドレスを用意 → `CONTACT_FROM_EMAIL` に設定。
     - 本番：Resend でドメインを検証し、そのドメインのアドレス（例：`noreply@あなたのドメイン`）。
     - 動作確認だけ：`onboarding@resend.dev`（Resend のテスト用送信元。**アカウント所有者のメール宛にのみ**送信可）。
  3. `RESEND_API_KEY` か `CONTACT_FROM_EMAIL` が未設定の間は、フォームは成功表示をせず「受け付けられない状態」のエラーを表示します（送信できていないのに成功と見せないため）。

---

## 7. ブログ（microCMS）

「microCMS 設定仕様書」の 2 API 構成（`categories` / `blogs`）に対応しています。

### microCMS 側の設定

| API | 種類 | フィールド |
|---|---|---|
| カテゴリ（`categories`） | リスト形式 | `name`（テキスト・必須）／`slug`（テキスト・必須・重複禁止）／`description`（複数行・任意）／`order`（数字・任意） |
| ブログ記事（`blogs`） | リスト形式 | `title`／`thumbnail`（画像）／`thumbnailAlt`（テキスト・任意）／`category`（コンテンツ参照）／`excerpt`（複数行）／`body`（リッチエディタ）／`publishedAt`（組み込み）／`keyPoints`（「この記事でわかること」・下記参照）／`articles`（おすすめの記事・下記参照） |

作成後、`.env.local` にサービスドメイン・API キー・各エンドポイント名を設定してください。

**任意フィールド（作れば自動で使われるもの）**

次の 2 つは `blogs` に無くても動きます。作成すると、追加の設定なしに表示・計測へ反映されます。

| フィールド | 型 | 効果 |
|---|---|---|
| `tags` | 複数選択のコンテンツ参照 または テキストの繰り返し | 記事下部にタグが表示され、解析の `article_tags` に反映されます |
| `author` | テキスト または コンテンツ参照（`name` を持つもの） | 解析の `author` に反映されます（未作成なら代表者名） |

※ 記事 URL は microCMS のコンテンツ ID をそのまま使う方針のため、**`slug` フィールドは使いません**。アクセス解析の `article_slug` は記事 URL（`/blog/{id}`）から自動取得しており、値はコンテンツ ID と同じになります。

**「おすすめの記事」（記事ごと）について**

- 各記事の詳細ページのサイドバー先頭に「おすすめの記事」欄を表示します（**記事ごとに手動で選んだ記事**）。
- microCMS の `blogs` に、**記事（blogs）への複数選択のコンテンツ参照フィールド `articles`**（参照上限 3）を作り、その記事に載せたいおすすめ記事を選んでください。
- **未選択の記事では欄ごと非表示**になります。表示中の記事自身が選ばれていても自動で除外します。
- フィールド名を `articles` 以外にする場合は、`lib/microcms.ts` の `BLOG_DETAIL_FIELDS` と `fetchBlogPost` の参照キー（`json.articles`）を合わせてください。

おすすめの記事は**記事ごとに設定**する方式のみです（サイト共通の一覧欄は設けていません）。設定しない記事では欄が非表示になるだけで問題ありません。

**実 API に合わせた実装上の注意（設定仕様書との差分）**

| 項目 | 実際の microCMS | 実装 |
|---|---|---|
| `category` | 単一参照ではなく**複数選択のコンテンツ参照**（配列で返る） | 配列として受け取り、カード・記事ページで全カテゴリを表示。単一参照に変更されても壊れないよう、取得時に配列へ正規化している |
| カテゴリ絞り込みの演算子 | 複数参照のため `category[equals]` では 0 件になる | `category[contains]{カテゴリID}` を使用（`lib/microcms.ts` の `categoryFilter`） |
| `thumbnail` / `thumbnailAlt` | 現在のスキーマには**未作成**（レスポンスに含まれない） | 未設定として扱い、ブランドモチーフのプレースホルダーを表示。フィールドを追加すればそのまま画像が表示される |

### 実装

- 取得は Server Component（`app/blog/page.tsx` → `app/blog/queries.ts` → `lib/microcms.ts`）で行います（クライアント側での取得は行いません）。
- 型は `types/blog.ts` に定義しています（`any` は使用していません）。
  - `BlogListItem`：一覧で使う項目。`thumbnail` と `category` は **null 許容**にしています。microCMS 側では必須設定の想定ですが、スキーマ変更や参照先削除で欠けても表示が壊れないようにするためです（欠けた場合はモチーフ画像／カテゴリ非表示にフォールバック）。
  - `BlogPost`：`BlogListItem` + `body`。記事詳細ページを作るときに使います。
- 一覧では `fields` パラメータで `id,title,thumbnail,thumbnailAlt,category,tags,excerpt,publishedAt,revisedAt,updatedAt` のみを取得し、**本文 `body` は取得していません**（不要なデータを送受信しないため）。このため、一覧クリックの計測には `word_count` / `reading_time` が含まれません。
- **ページネーション**：`limit` / `offset` によるページ番号方式を `/blog?page=2` の形で実装しています（1 ページ 9 件、`lib/microcms.ts` の `BLOG_PAGE_SIZE`）。各ページが個別 URL を持ち JavaScript も不要なため暫定でこの方式にしています。「もっと見る」方式に変更する場合は `components/Pagination.tsx` を差し替えてください。
- **カテゴリ絞り込み**：`/blog?category={slug}` で `filters=category[equals]{カテゴリID}` を使って絞り込みます。slug からカテゴリ ID への解決はカテゴリ API の取得結果から行っています。`MICROCMS_CATEGORY_ENDPOINT` が未設定の場合は絞り込み UI を表示せず、記事一覧のみを表示します。
- 表示状態は次のとおりです。
  - 読み込み中：`app/blog/loading.tsx`（「記事を読み込んでいます…」）
  - 記事 0 件：「公開中の記事はまだありません」（カテゴリ絞り込み時は「『◯◯』の記事はまだありません」）
  - API エラー：`app/blog/error.tsx`（「記事を取得できませんでした」＋再読み込みボタン）
  - 環境変数が未設定：「ブログの接続設定が未完了です」（設定手順を案内）
  - 存在しないカテゴリ slug／記事のないページ番号：404 表示
    - ※ `loading.tsx` によるストリーミングが先に始まる関係で、この 404 は HTTP ステータスが 200 のままになります（ソフト 404）。検索エンジンに拾われないよう、該当時は `robots: noindex` を出力しています。
- サムネイル画像は `next/image` で表示し、`alt` には microCMS の `thumbnailAlt` を使います（未入力時は装飾画像として空文字＝読み上げ対象外）。画像自体が未設定の記事はブランドモチーフのプレースホルダーを表示します。

### 記事詳細ページ（`/blog/{記事ID}`）

- 一覧のカード全体が記事詳細へのリンクになっています。URL は microCMS のコンテンツ ID を使います。
- 公開済みの記事はビルド時に事前生成し（`generateStaticParams`）、60 秒ごとに再検証します。ビルド後に追加された記事も、初回アクセス時に生成されて表示されます。
- 存在しない記事 ID は 404（`robots: noindex`）になります。
- **SEO のための内部リンク**を配置しています。
  - 目次（本文の見出しから自動生成。開閉式で、クリックで該当の章へ移動）
  - パンくずリスト（ホーム / ブログ / 記事タイトル）＋ `BreadcrumbList` の構造化データ
  - 関連記事：同じカテゴリの新着記事を最大 4 件（表示中の記事は除外。該当がなければその旨を表示）
  - 最近の投稿：新着記事を最大 5 件（表示中の記事は除外。他に記事がなければ非表示）
  - 記事のカテゴリから一覧の絞り込み（`/blog?category={slug}`）へのリンク
  - 記事一覧へ戻る／お問い合わせ／事業内容へのリンク
- 構造化データとして `BlogPosting` も出力しています（`headline` / `datePublished` / `articleSection` など）。
- OGP は `og:type=article` とし、サムネイルがある場合は `og:image` に設定します。`description` は `excerpt` から生成します。

### この記事でわかること

- 記事詳細の冒頭（抜粋の下・目次の上）に、**チェック付きの箇条書き**で「この記事でわかること」を表示します（`components/ArticleKeyPoints.tsx`）。
- microCMS の `blogs` に **`keyPoints`** フィールドを追加してください。次のどちらの形でも動きます（`lib/microcms.ts` の `parseKeyPoints`）。
  - **複数行テキスト**（推奨）：1 行 = 1 項目。行頭に `・` や `-` を付けても自動で取り除きます。
  - **繰り返しフィールド**：各要素の `text`（等）を 1 項目として扱います。
- **未設定・未入力の記事では欄ごと非表示**になります（既存記事に影響しません）。
- フィールド名を `keyPoints` 以外にする場合は、`lib/microcms.ts` の `BLOG_DETAIL_FIELDS` と `parseKeyPoints` の参照キーを合わせてください。

### 目次

- 記事本文の見出しから**自動生成**します（`lib/richText.ts`）。本文の見出しに `heading-1`, `heading-2` … という id を振り、その id へのリンクを目次にします。
- **開閉式**です。`<details>` / `<summary>` のブラウザ標準機能を使っているため JavaScript は増えていません（キーボード操作・スクリーンリーダー対応も標準のまま）。初期表示は開いた状態です。
- 目次の項目をクリックすると該当の見出しへスクロールします。固定ヘッダーに隠れないよう、見出しに `scroll-mt-28`（112px）を設定しています。
- H2 と H3 は見た目で階層を区別しています。H3 は左に余白とガイド線を付けてインデントし、文字を一段小さく・淡い色にしています。
- 見出しが 1 つも無い記事では、目次は表示されません。
- **microCMS のリッチエディタで「見出し」を使って書いてください。** 太字にしただけの行は見出しとして扱われず、目次に載りません。
- リッチエディタの「見出し1」は `h1` で出力されますが、ページ内の `h1` は記事タイトルだけにしたいため、表示時に `h2` へ変換しています（見出しの階層が崩れず、目次にも載ります）。
  - ※ 1 つの記事で「見出し1」と「見出し2」を併用すると、どちらも同じ階層（h2）になります。階層を分けたい場合は「見出し2」と「見出し3」を使ってください。

### 本文（リッチエディタ）の扱い

- 本文は HTML 文字列のため、JSX の中括弧展開では表示できません。`lib/sanitizeHtml.ts` で**許可タグ・許可属性のホワイトリスト**（`sanitize-html`）を通したうえで、`components/RichText.tsx` でのみ挿入しています。
  - `script` / `iframe` / `on*` 属性 / `javascript:` スキームは除去されます（モックデータで実際に除去されることを確認済み）。
  - `target="_blank"` のリンクには `rel="noopener noreferrer"` を自動付与します。
- **`components/RichText.tsx` と `components/JsonLd.tsx` 以外で `dangerouslySetInnerHTML` を使わないでください。** それ以外の値はすべて JSX の中括弧展開で描画しています。
- 構造化データ（JSON-LD）は `components/JsonLd.tsx` に集約しています。記事タイトルなど CMS 由来の文字列が入るため、不等号を Unicode エスケープしてから出力しています（JSX の中括弧展開だと React が HTML エスケープしてしまい、`&` や `<` を含むタイトルで JSON-LD が壊れるため）。
- 本文の見た目は `@tailwindcss/typography` の `prose` を使い、配色は `tailwind.config.ts` の `typography.brand` で定義しています。
- 本文中に microCMS で挿入された画像（`<img>`）は `next/image` を通らないため、`lib/sanitizeHtml.ts` で画像 URL に `fm=webp` を付けて **WebP 配信**にしています（microCMS の画像 API は `auto=format` 非対応のため `fm=webp` を明示）。microCMS 以外のホストの画像や、すでに `fm` 指定がある URL はそのままにします。

### 画像の WebP 化（サイト全体）

元が JPEG / PNG でも WebP で配信します。仕組みは画像の種類で 2 通りです。

| 画像の種類 | 例 | WebP 化の方法 |
|---|---|---|
| `next/image` で表示する画像 | 代表者写真、microCMS のサムネイル画像、`public/` のローカル画像 | `next.config.ts` の `images.formats: ['image/webp']` により、`next/image` が自動で WebP に変換して配信 |
| 記事本文に挿入された microCMS 画像 | リッチエディタ内の `<img>` | `lib/sanitizeHtml.ts` が画像 URL に `fm=webp` を付与（microCMS の画像 API 側で WebP 変換） |

### 見出しのデザイン

記事本文の見出しには、microCMS で選んだ見出しレベルに応じて自動でスタイルが付きます（`app/globals.css`）。線の色はブランドのアクセント（青空のブルー `#1A76B8`）で統一しています。

| microCMS で選ぶ見出し | 実際に出力されるタグ | 表示 |
|---|---|---|
| 見出し1 | `<h2>` | 文字の**左横に縦線**（5px）。折り返しても行数ぶん縦線が伸びます |
| 見出し2 | `<h3>` | **文字列と同じ長さの下線**（2px） |
| 見出し3 | `<h4>` | 先頭に**ハイフン**（`-`） |

> ⚠ **タグと見出しレベルが 1 段ずれている点に注意してください。**
> `lib/sanitizeHtml.ts` で本文の見出しを 1 段ずつ下げているためです（ページ内の `h1` を記事タイトルの 1 つだけにして、見出し階層を正しく保つため）。
> スタイルを調整するときは、`h2` = 見出し1、`h3` = 見出し2、`h4` = 見出し3 として編集してください。

セレクタは `.prose`（記事本文）配下に限定しているため、「この記事でわかること」「関連記事」など本文の外にある見出しには影響しません。

### コラム（囲み枠）

記事本文の中に、四角い枠のコラム（囲み記事）を入れられます。**コードを触らずに microCMS の操作だけで配置できます。**

**microCMS 側の初回設定（1 回だけ）**

1. 対象 API（`blogs`）→「API 設定」→ 本文（`body`）フィールドの「編集」→ 詳細設定を開く。
2. 「カスタム class」を追加する。
   - クラス名：`column`
   - 表示名：「コラム（囲み枠）」など分かりやすい名前
   - プレビュー用 CSS は任意（管理画面での見え方だけに影響し、公開ページの見た目には影響しません）。

**記事を書くとき**

1. コラムにしたい段落を書く。
2. その段落（または文字）を選択し、ツールバーのカスタム class から「コラム」を適用する。
3. これだけで、公開ページでは薄い青の四角い枠＋「コラム」ラベル付きのボックスになります。

**仕組み（コード側）**

- microCMS は選択範囲を `<span class="column">`、段落全体なら `<p class="column">` で出力します。`lib/sanitizeHtml.ts` で `column` クラスを残し、`app/globals.css` の `.column` スタイルで枠を描画しています。
- 枠のデザイン（色・角丸・ラベル文言「コラム」）を変えたい場合は `app/globals.css` の `.prose ... .column` を編集してください。
- 別の見た目の枠を増やしたい場合は、microCMS 側で別のクラス名（例：`note`）を追加し、`app/globals.css` に対応するスタイルを足します（`class` 属性自体はサニタイズを通過するため、`lib/sanitizeHtml.ts` の変更は不要です）。

### 要確認事項（設定仕様書の未確定項目に対する現状）

| 項目 | 現状の実装 |
|---|---|
| カテゴリの名称・粒度 | 実装はカテゴリ名を microCMS から取得して表示するだけなので、**カテゴリを増減してもコード修正は不要**です。 |
| `category` は単一参照か複数選択か | 実際のスキーマが**複数選択**だったため、配列として実装済み（単一参照に戻しても動作します）。 |
| `body` のサニタイズ方針 | `sanitize-html` を採用し、許可タグ・許可属性のホワイトリスト方式で実装済み（`lib/sanitizeHtml.ts`）。許可タグを増減する場合はこのファイルだけを編集してください。 |
| タグ機能 | 未実装（要件外のため）。 |
| ページネーション UI | ページ番号方式で実装済み（上記）。「もっと見る」方式にするかは要確認。 |

---

## 8. SEO

- タイトルの命名規則「◯◯｜春原中小企業診断士事務所」は `app/layout.tsx` の `title.template` で一元管理しています（トップページのみ「春原中小企業診断士事務所｜超・現場主義」）。
- 各ページの `title` / `description` / canonical / OGP は `lib/metadata.ts` の `buildPageMetadata()` で生成し、ページごとに個別の内容を設定しています。
- ブログ一覧のページ送り・カテゴリ絞り込みは、`title` と canonical をクエリパラメータ込みの実 URL に合わせています（例：`ブログ（2ページ目）` / `https://example.com/blog?page=2`）。
- トップページに `ProfessionalService` の JSON-LD を出力しています（`name` / `slogan` / `address` / `telephone` / `hasOfferCatalog`）。値は `lib/siteConfig.ts`・`lib/services.ts` を参照しており、ページ表示との不一致が起きません。
- `robots.txt` と `sitemap.xml` は `app/robots.ts` / `app/sitemap.ts` で生成しています。sitemap には固定 5 ページ（`NAV_ITEMS` から自動生成）に加えて、**microCMS の記事 URL** も含めます（記事の更新日を `lastModified` に設定）。microCMS に到達できない場合は固定ページのみを出力し、ビルドは失敗させません。
  - ※ 記事が 100 件を超える場合は sitemap 側でページングが必要です（`lib/microcms.ts` の `fetchBlogSitemapEntries` にコメントあり）。

### アクセス解析（GA4 + Google Tag Manager）

計測は **コード → `dataLayer` → GTM → GA4** の順に流れます。コードから GA4（gtag）へ直接送信はしません。

- **設定・運用の詳細は [`docs/analytics.md`](docs/analytics.md) にまとめています**（イベント一覧・パラメータ一覧・GTM の設定手順・動作確認方法・イベント追加手順）。
- 読み込みは `components/analytics/GoogleTagManager.tsx`、計測基盤は `components/analytics/AnalyticsProvider.tsx`（`app/layout.tsx` から全ページに適用）。`next/script` の `afterInteractive` で読み込むため、表示速度への影響を抑えています。
- ID は環境変数で管理します。`NEXT_PUBLIC_GTM_ID`（GTM コンテナ ID）と `NEXT_PUBLIC_GA_ID`（GA4 測定 ID）。**どちらも HTML に出る公開値**なので `NEXT_PUBLIC_` で問題ありません（秘匿情報ではない）。GA4 の測定 ID は `dataLayer` 経由で GTM に渡しており、GTM 側にもベタ書きしません。
- **本番ビルド（`npm run build` / `npm run start`）でのみ読み込みます。** 開発時（`npm run dev`）は計測データを汚さないよう読み込みません（`NEXT_PUBLIC_ANALYTICS_DEBUG=true` で一時的に有効化・ログ出力できます）。
- 計測しているイベント：`page_view` / `scroll_25`〜`scroll_100` / `cta_click` / `related_article_click` / `external_link_click` / `pdf_download` / `article_select` / `category_select` / `tag_select` / `form_view` / `form_start` / `form_submit` / `toc_click`。
- 記事の情報は記事データから自動付与されるため、**記事を追加してもコード修正は不要**です。記事ページで発生するすべてのイベント（CTA クリック・関連記事クリック・目次クリックなど）に付きます。

  | パラメータ | 内容 |
  | --- | --- |
  | `article_id` / `article_slug` | コンテンツ ID と、記事 URL（`/blog/{id}`）から取得した slug。URL がコンテンツ ID そのままの設計のため**両者は同じ値**になります（GA4 の `page_path` と突き合わせやすいよう別パラメータとして送っています） |
  | `article_title` / `article_category` / `article_tags` | タイトル・カテゴリ・タグ |
  | `publish_date` / `publish_year` | 公開日（`YYYY-MM-DD`）と公開年（数値） |
  | `updated_date` / `is_updated` | 更新日と、公開後に更新されたか（**同日は `false`**） |
  | `word_count` / `reading_time` | 本文の実文字数と推定読了時間（分／日本語 500 文字・分で算出） |
  | `author` | 執筆者（microCMS の `author`、無ければ代表者名） |

  ※ `word_count` / `reading_time` は本文を取得する記事ページのイベントのみに付きます（一覧クリックには付きません）。
- **目次クリック**（`toc_click`）は `toc_text` / `toc_anchor` / `toc_level` を送ります。どの見出しが求められているかが分かるため、記事の構成改善やリライトの判断材料になります。
- 分析の切り口（記事別の CTA 率、リライト効果、文字数と読了率の相関、目次クリックの傾向など）は [`docs/analytics.md`](docs/analytics.md) の「Looker Studio での分析例」にまとめています。
- **GA4 のカスタムディメンションに登録するのは 9 個 + 指標 1 個だけ**です。送信しているパラメータをすべて登録すると、固有値の多いもの（外部リンク URL・見出しテキストなど）がレポートの精度を下げます。記事ごとの分析は**組み込みの「ページパス」「ページタイトル」**を軸にし、カスタムディメンションはそこに属性を足す用途に絞っています。登録すべき一覧と、登録しないものの理由は [`docs/analytics.md`](docs/analytics.md) の「GA4 で登録するカスタムディメンション」を参照してください（登録しないパラメータも送信は続けているため、必要になった時点で登録できます）。
- ⚠ GA4 の「拡張計測機能」のうち **ページビュー数・スクロール数・離脱クリック・ファイルのダウンロードは オフ** にしてください（本実装と二重計測になります）。
- ⚠ イベントを増やしても **GTM の設定変更は不要**です（イベント名に `{{Event}}`、トリガーに「`gtm.` 以外のすべて」を使っているため）。GTM の作業が必要になるのは**新しいパラメータを追加したとき**だけです。

---

## 9. デザインの方針

- **よく晴れた青空をイメージした配色**です。`tailwind.config.ts` の `theme.extend.colors.brand` に定義しています。濃い面はフッターだけにとどめ、全体を明るく保っています。

| 用途 | クラス | 色 |
|---|---|---|
| ページ背景（晴れた空の淡い色） | `bg-brand-bg` | `#F2FAFF` |
| 見出し・フッター・塗りボタン | `text-brand-navy` / `bg-brand-navy` | `#0F5486` |
| アクセント（青空のブルー。文字・塗りボタンに使用可） | `text-brand-accent` / `bg-brand-accent` | `#1A76B8` |
| 明るい空色（**装飾専用**。文字や文字の背景には使わない） | `bg-brand-sky` | `#7FCDF5` |
| 陽ざしの差し色（**装飾専用**） | `bg-brand-sun` | `#FFD25E` |
| ヒーローの空グラデーション | `bg-sky` | 白に近い空 → 昼の空 |

- ヒーロー・下層ページの見出し帯は**明るい空のグラデーション**で、文字は白ではなく `text-brand-navy` / `text-brand-ink` を重ねます。
- **文字に使う色はすべて WCAG AA（4.5:1）以上**です（最小は「アクセント文字 on 淡い背景」の 4.60:1）。
  - ⚠ `text-brand-muted` は空グラデーションの上では 3.3:1 になり基準を下回ります。**ヒーロー内の補足文には `text-brand-ink` を使ってください。**
  - 明るい空色（`sky` / `sun` / `accentsoft`）は文字色に使わず、光のにじみなどの装飾だけに使ってください。
- 親しみやすさは、角丸（カード `rounded-2xl` / ボタンは丸型）、やわらかい影、ヒーローに重ねた陽ざしの光で表現しています。
- 視覚モチーフは「現場で押し上げる折れ線」1 種類に統一し、`components/BrandMotif.tsx` に集約しています（`hero` / `rule` / `mark` の 3 形態）。装飾を追加する場合もこのファイルに variant を足す形にし、別のモチーフを増やさないでください。
- **書体はサイト全体を Noto Sans JP に統一しています**（`app/layout.tsx` で `next/font/google` から読み込み、可変フォント）。見出し・本文・キャッチフレーズはすべて同じ書体で、見出しは太さ（`font-bold`）で差をつけています。
  - `tailwind.config.ts` の `fontFamily` には `sans` / `display` / `mincho` の 3 つの別名がありますが、これは過去の使い分けの名残で、**中身はすべて Noto Sans JP** です（各コンポーネントの `font-display` / `font-mincho` クラスを一括置換せずに済むよう残しています）。
  - Noto Sans JP は可変フォントのため、任意の太さ（`font-medium` / `font-bold` など）を追加のフォント読み込みなしで使えます。
- レスポンシブは Tailwind の `sm:` / `md:` / `lg:` を使用し、375px〜1440px で横スクロールが発生しないことを確認しています。
- リンク・ボタン・フォーム部品には `focus-visible:` によるフォーカスリングを設定しています。ページ先頭には「本文へスキップ」リンクがあります。

### CTA（お問い合わせ導線）

- **主要 CTA は sun（黄）1 色に統一**しています（`components/PrimaryCta.tsx`）。青系の他ボタンと明確に区別するための専用色で、**この色は CTA 以外に使いません**。黄 × 濃紺文字のコントラストは 5.56:1（WCAG AA 適合）。
- **グローバルナビ**：sun の「相談する」ボタン（PC・モバイル両方）。電話番号を掲載する設定にすると、その隣に電話リンクが追加されます。
- **ファーストビュー**：ホームはヒーローに CTA、下層ページは `components/PageHeader.tsx` の `cta` プロップで各ページに CTA を表示（お問い合わせページは自ページのためボタンなし）。
- **コンテンツ末尾**：`components/CtaSection.tsx`（濃紺の帯・中央揃え）を各ページ末尾に配置。ページごとに見出し・リード文・ボタンラベルを内容に合わせて変えています（例：事業内容→「自社に必要な支援が分からない、から始めてOKです」）。ボタンは主要 CTA 1 つに絞っています。
- **電話が非掲載のとき**は、電話導線があった箇所がフォームへの案内文に切り替わります（ヒーロー・CTA 帯・記事のファーストビュー・お問い合わせページのサイド・フッター）。`lib/siteConfig.ts` の `tel` に番号を入れれば元に戻ります。
- **CTA に載せる訴求情報**は `lib/siteConfig.ts` の `consultation` を参照します。事実のみを表示し、費用・締切・キャンペーンは記載していません。
  - `consultation.online`（オンライン相談の可否）：現在 `true` で「オンライン相談も承っています」と表示。
  - `consultation.durationNote`（所要時間の目安）：現在 `null` で**非表示**。値を入れると CTA 帯に併記されます（例：`'初回は30分ほど'`）。
  - ※ 「無料相談」等の費用に関する表記は、事実が未確認のため使っていません。初回無料などが確定したら、この方針に沿って文言を追加してください。

---

## 10. 表示速度（LCP / TBT）

### 実施した対策

| 対策 | 効果 |
|---|---|
| Web フォントは Noto Sans JP の 1 書体のみ | 日本語 Web フォントは `@font-face` 定義を多数生成し、CSS が増えます。書体を 1 つに統一し、可変フォント（1 ファイルで全ウェイト）で読み込むことで、複数ウェイトを追加しても CSS が増えないようにしています。 |
| microCMS 画像ドメインへの `preconnect` | 記事サムネイルの取得開始を前倒しします（`app/layout.tsx`）。 |
| 画像最適化結果のキャッシュ延長 | `next.config.ts` の `images.minimumCacheTTL` を 30 日に設定。 |
| トップページを静的生成のまま維持 | 「最近のブログ」の取得は ISR（60 秒）で行い、リクエストごとのサーバー処理を発生させません。 |

トップページの転送量（gzip、HTML + CSS + JS + フォント）の推移は次のとおりです。

| 状態 | CSS | フォント | 合計 |
|---|---|---|---|
| 初期（日本語 Web フォント 2 書体） | 73.0 KB | 57.1 KB | 324.8 KB |
| Web フォントなし（端末標準書体） | 6.2 KB | 0 KB | 208.2 KB |
| **現在（Noto Sans JP に統一）** | 40.4 KB | 24.4 KB | **268.4 KB** |

Noto Sans JP に統一したことで初期よりは軽い一方、端末標準書体のみの状態（208KB）より重くなっています。これは「サイト全体を Noto Sans JP で表示する」という指定を優先した結果です（フォントの見た目と表示速度のトレードオフ）。フォント本体は Latin サブセットのみを先読みし、日本語グリフは表示に必要な範囲だけを分割ファイルから遅延読み込みします。
**表示速度を最優先したい場合**は、`app/layout.tsx` の `Noto_Sans_JP` の読み込みと `html` の `className` を外し、`tailwind.config.ts` の `fontFamily` 各定義の先頭から `var(--font-noto-sans-jp)` を削除してください。端末標準のゴシック体にフォールバックし、208KB 相当まで下がります。

### 計測方法（重要）

**`npm run dev` の状態で Lighthouse を実行しないでください。** 開発サーバーは未圧縮の React・HMR・リクエスト時コンパイルを含むため、TBT・LCP が実際の数倍悪く出ます。必ず本番ビルドで計測してください。

```bash
npm run build
```

そのうえで `npm run start` を実行し、`http://localhost:3000` に対して Lighthouse を実行します。

### 残っている負荷

JavaScript は約 190KB(gzip) で、その大半は React と Next.js（App Router）のランタイムです。アプリ側の Client Component はヘッダーのモバイルメニューとお問い合わせフォームのみで、それ以外はすべて Server Component のため、これ以上の削減余地は限定的です。TBT がまだ高く出る場合は、まず計測環境（開発サーバーかどうか、拡張機能の有無）を確認してください。

---

## 11. デプロイ

デプロイ先は未確定です。Next.js（App Router / Server Actions）が動作する環境であれば構いません（例：Vercel などの Node.js 実行環境）。**あくまで例であり、指定ではありません。**

デプロイ時は、`.env.local` に設定した環境変数を、デプロイ先の環境変数設定にも同じ名前で登録してください。あわせて `lib/siteConfig.ts` の `SITE_URL` を本番ドメインへ変更してください（canonical・OGP・sitemap に反映されます）。
