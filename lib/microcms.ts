import type {
  BlogListItem,
  BlogListResult,
  BlogPost,
  BlogSitemapEntry,
  Category,
  CategoryListResult,
  MicroCMSImage,
  MicroCMSListResponse,
  Tag,
} from '@/types/blog';
import { SERVICES } from '@/lib/services';
import type { ServicePageContent, ServiceSection } from '@/types/service';
import type { Tool, ToolCategory, ToolDirectory } from '@/types/tool';

/**
 * microCMS からブログ記事・カテゴリを取得する（Server Component から呼び出す前提）。
 *
 * 「microCMS 設定仕様書」の 2 API 構成に対応する。
 * - blogs      : 記事本体（category は categories への単一参照）
 * - categories : カテゴリのマスタ
 *
 * API キー（MICROCMS_API_KEY）はサーバー側でのみ使用する秘匿値。
 * NEXT_PUBLIC_ プレフィックスを付けてはいけない。
 */

/** 一覧 1 ページあたりの表示件数 */
export const BLOG_PAGE_SIZE = 9;

/** ISR: 取得結果のキャッシュ再検証間隔（秒） */
const REVALIDATE_SECONDS = 60;

/**
 * 一覧で取得するフィールド（本文 body は一覧で使わないため取得しない）。
 * ※ tags は任意フィールド。microCMS 側に存在しない間はレスポンスに含まれないだけで、
 *   エラーにはならない（存在すれば計測の article_tags として自動的に使われる）。
 * ※ revisedAt / updatedAt は日時 2 つだけで軽いため、一覧でも取得している
 *   （一覧クリックの計測で updated_date / is_updated を送るため）。
 */
const BLOG_LIST_FIELDS =
  'id,title,thumbnail,thumbnailAlt,category,tags,excerpt,publishedAt,revisedAt,updatedAt';

/**
 * 記事詳細で取得するフィールド。
 * 一覧の項目 + 本文 + 「この記事でわかること」(keyPoints) + おすすめの記事(articles)
 * + 執筆者（author。任意フィールド）。
 * ※ keyPoints / articles は microCMS の blogs 側に作るフィールド。存在しなくてもレスポンスに
 *   含まれないだけでエラーにはならない（microCMS は fields に未知の名前を指定しても 200 を返す）。
 *   フィールド名を変える場合はここと parseKeyPoints / fetchBlogPost の参照キーを合わせる。
 */
const BLOG_DETAIL_FIELDS = `${BLOG_LIST_FIELDS},body,keyPoints,articles,author`;

/**
 * カテゴリでの絞り込み条件を組み立てる。
 * ※ category は「複数選択のコンテンツ参照」のため、演算子は equals ではなく contains を使う
 *   （equals では 0 件になることを実 API で確認済み）。
 */
function categoryFilter(categoryId: string): string {
  return `category[contains]${categoryId}`;
}

/** microCMS へのリクエストに失敗したことを示すエラー。app/blog/error.tsx で表示される。 */
export class MicroCMSRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MicroCMSRequestError';
  }
}

type MicroCMSConfig = {
  serviceDomain: string;
  apiKey: string;
  blogEndpoint: string;
  /** カテゴリ API は任意（未設定でも記事一覧は表示できる） */
  categoryEndpoint?: string;
};

/**
 * サービスドメインを正規化する。
 * 正しくは「サービスドメイン名だけ」（例: your-service）だが、管理画面の API プレビュー URL を
 * そのまま貼られることが多いため、URL 形式（https://your-service.microcms.io/api/v1/blogs）でも受け付ける。
 */
function normalizeServiceDomain(value: string): string {
  const trimmed = value.trim();
  const matched = /^https?:\/\/([^./]+)\.microcms\.io/.exec(trimmed);
  return matched ? matched[1] : trimmed;
}

/**
 * エンドポイント名を正規化する。
 * 正しくは「API の ID だけ」（例: blogs）だが、URL 全体を貼られた場合は末尾のセグメントを採用する。
 */
function normalizeEndpoint(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/+$/, '').split('/').pop() || undefined;
}

/** 環境変数がそろっていれば設定を返し、足りなければ null を返す */
function getConfig(): MicroCMSConfig | null {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = process.env.MICROCMS_API_KEY?.trim();
  const blogEndpoint = normalizeEndpoint(process.env.MICROCMS_BLOG_ENDPOINT);

  if (!serviceDomain || !apiKey || !blogEndpoint) return null;

  return {
    serviceDomain: normalizeServiceDomain(serviceDomain),
    apiKey,
    blogEndpoint,
    categoryEndpoint: normalizeEndpoint(process.env.MICROCMS_CATEGORY_ENDPOINT),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/** リスト形式 API を取得する共通処理 */
async function requestList(
  config: MicroCMSConfig,
  endpoint: string,
  searchParams: Record<string, string>,
): Promise<MicroCMSListResponse<unknown>> {
  const url = new URL(`https://${config.serviceDomain}.microcms.io/api/v1/${endpoint}`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': config.apiKey },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    // ネットワーク到達不可など。原因の詳細（URL・キー）は画面に出さない。
    throw new MicroCMSRequestError('microCMS へのリクエストに失敗しました。');
  }

  if (!response.ok) {
    throw new MicroCMSRequestError(
      `microCMS からデータを取得できませんでした（HTTP ${response.status}）。`,
    );
  }

  const json: unknown = await response.json();
  if (!isRecord(json) || !Array.isArray(json.contents) || typeof json.totalCount !== 'number') {
    throw new MicroCMSRequestError('microCMS のレスポンス形式が想定と異なります。');
  }

  return json as unknown as MicroCMSListResponse<unknown>;
}

/**
 * オブジェクト形式 API を取得する共通処理。
 * リスト形式（contents 配列）と違い、フィールドがトップレベルに並んだオブジェクトを返す。
 */
function parseImage(value: unknown): MicroCMSImage | null {
  if (!isRecord(value)) return null;
  const { url, width, height } = value;
  if (typeof url !== 'string' || typeof width !== 'number' || typeof height !== 'number') {
    return null;
  }
  return { url, width, height };
}

function parseCategory(value: unknown): Category | null {
  if (!isRecord(value)) return null;
  const id = getString(value.id);
  const name = getString(value.name);
  const slug = getString(value.slug);
  if (!id || !name || !slug) return null;

  return {
    id,
    name,
    slug,
    description: getString(value.description),
    order: typeof value.order === 'number' ? value.order : undefined,
  };
}

/**
 * category フィールドを配列に正規化する。
 * 複数選択（配列）でも単一参照（オブジェクト）でも受け取れるようにしている。
 */
function parseCategories(value: unknown): Category[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .map(parseCategory)
    .filter((category): category is Category => category !== null);
}

/**
 * tags フィールドを配列に正規化する（任意フィールド。無ければ空配列）。
 * 参照フィールド（{ id, name, slug }）でも、文字列の配列でも受け取れるようにしている。
 */
function parseTags(value: unknown): Tag[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): Tag[] => {
    if (typeof item === 'string') {
      const name = item.trim();
      return name ? [{ id: name, name }] : [];
    }
    if (!isRecord(item)) return [];

    const name = getString(item.name) ?? getString(item.label) ?? getString(item.title);
    if (!name) return [];
    return [{ id: getString(item.id) ?? name, name, slug: getString(item.slug) }];
  });
}

/**
 * author フィールドから執筆者名を取り出す（任意フィールド）。
 * テキストでも、参照フィールド（{ name }）でも受け取れる。
 */
function parseAuthor(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (isRecord(value)) return getString(value.name)?.trim() || undefined;
  return undefined;
}

/** 繰り返しフィールドの 1 要素から表示テキストを取り出す（よくあるキー名を順に見る） */
function extractKeyPointText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (isRecord(value)) {
    for (const key of ['text', 'point', 'item', 'value', 'label']) {
      const text = getString(value[key]);
      if (text) return text.trim();
    }
  }
  return '';
}

/**
 * 「この記事でわかること」の箇条書きを配列に正規化する。
 * microCMS 側の設定に幅があるため、次のどちらでも受け取れるようにしている。
 *  1. 複数行テキスト（string）… 1 行 1 項目。行頭の記号（・- * • □ ✓ 等）は取り除く。
 *  2. 繰り返しフィールド（配列）… 各要素の text 等を採用。
 */
function parseKeyPoints(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(extractKeyPointText).filter((text) => text.length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\s　]*[-*・•‐–—□☑✓✔]?[\s　]*/, '').trim())
      .filter((line) => line.length > 0);
  }
  return [];
}

/**
 * API レスポンスを一覧表示用に整形する。
 * 必須項目（id / title）が欠けているものだけ除外し、他は欠損してもフォールバックして表示する。
 */
function parseListItem(value: unknown): BlogListItem | null {
  if (!isRecord(value)) return null;
  const id = getString(value.id);
  const title = getString(value.title);
  if (!id || !title) return null;

  return {
    id,
    title,
    thumbnail: parseImage(value.thumbnail),
    thumbnailAlt: getString(value.thumbnailAlt) ?? '',
    categories: parseCategories(value.category),
    tags: parseTags(value.tags),
    excerpt: getString(value.excerpt) ?? '',
    publishedAt: getString(value.publishedAt),
    // 更新日は revisedAt（コンテンツの実質的な更新日時）を優先する
    updatedAt: getString(value.revisedAt) ?? getString(value.updatedAt),
  };
}

/**
 * カテゴリ一覧を取得する（絞り込みナビゲーション用）。
 * MICROCMS_CATEGORY_ENDPOINT が未設定の場合は 'not-configured' を返し、絞り込み UI を出さない。
 */
export async function fetchCategories(): Promise<CategoryListResult> {
  const config = getConfig();
  if (!config?.categoryEndpoint) {
    return { status: 'not-configured' };
  }

  const json = await requestList(config, config.categoryEndpoint, {
    // 表示順フィールド（order）で並べる。未設定のカテゴリがあっても取得自体は成功する。
    orders: 'order',
    limit: '100',
  });

  const categories = json.contents
    .map(parseCategory)
    .filter((category): category is Category => category !== null);

  return { status: 'ok', categories };
}

/**
 * ブログ記事一覧を取得する。
 * @param page       1 始まりのページ番号
 * @param categoryId 絞り込むカテゴリのコンテンツ ID（省略時は絞り込みなし）
 */
export async function fetchBlogPosts({
  page = 1,
  categoryId,
}: { page?: number; categoryId?: string } = {}): Promise<BlogListResult> {
  const config = getConfig();
  // 環境変数が未設定の場合はエラーではなく「未設定」として扱い、画面に設定手順を出す。
  if (!config) {
    return { status: 'not-configured' };
  }

  const json = await requestList(config, config.blogEndpoint, {
    fields: BLOG_LIST_FIELDS,
    orders: '-publishedAt',
    limit: String(BLOG_PAGE_SIZE),
    offset: String((page - 1) * BLOG_PAGE_SIZE),
    ...(categoryId ? { filters: categoryFilter(categoryId) } : {}),
  });

  const posts = json.contents
    .map(parseListItem)
    .filter((post): post is BlogListItem => post !== null);

  return {
    status: 'ok',
    posts,
    totalCount: json.totalCount,
    pageSize: BLOG_PAGE_SIZE,
  };
}

/**
 * 記事を 1 件、一覧表示に必要な項目だけ取得する。
 *
 * fetchBlogPost と違い本文（body）等を取得しない軽量版。
 * 本文中の埋め込みリンク（lib/richText.ts の resolveEmbeddedLinkCards）を
 * カード表示に差し替えるためのもので、失敗時は例外を投げず null を返す
 * （埋め込みカードが解決できないだけで記事本文全体の表示を止めたくないため）。
 */
export async function fetchBlogListItemById(id: string): Promise<BlogListItem | null> {
  const config = getConfig();
  if (!config) return null;

  const url = new URL(
    `https://${config.serviceDomain}.microcms.io/api/v1/${config.blogEndpoint}/${encodeURIComponent(id)}`,
  );
  url.searchParams.set('fields', BLOG_LIST_FIELDS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': config.apiKey },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const json: unknown = await response.json();
  return parseListItem(json);
}

/**
 * 記事を 1 件取得する（記事詳細ページ用）。
 * 存在しない ID の場合は null を返す（呼び出し側で notFound() にする）。
 */
export async function fetchBlogPost(id: string): Promise<BlogPost | null> {
  const config = getConfig();
  if (!config) return null;

  const url = new URL(
    `https://${config.serviceDomain}.microcms.io/api/v1/${config.blogEndpoint}/${encodeURIComponent(id)}`,
  );
  url.searchParams.set('fields', BLOG_DETAIL_FIELDS);
  // articles（おすすめ記事）は参照先の記事、さらにその中のカテゴリ参照まで展開したいので depth=2。
  url.searchParams.set('depth', '2');

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': config.apiKey },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    throw new MicroCMSRequestError('microCMS へのリクエストに失敗しました。');
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new MicroCMSRequestError(
      `microCMS から記事を取得できませんでした（HTTP ${response.status}）。`,
    );
  }

  const json: unknown = await response.json();
  const listItem = parseListItem(json);
  if (!listItem) return null;

  // おすすめの記事（記事側の複数参照フィールド articles）。表示中の記事自身は除外する。
  const recommendedPosts = (isRecord(json) && Array.isArray(json.articles) ? json.articles : [])
    .map(parseListItem)
    .filter((item): item is BlogListItem => item !== null && item.id !== listItem.id)
    .slice(0, RECOMMENDED_LIMIT);

  return {
    ...listItem,
    body: (isRecord(json) && getString(json.body)) || '',
    keyPoints: isRecord(json) ? parseKeyPoints(json.keyPoints) : [],
    author: isRecord(json) ? parseAuthor(json.author) : undefined,
    recommendedPosts,
  };
}

/**
 * 内部リンク用の記事リストを取得する。
 * @param categoryId 指定するとそのカテゴリの記事に絞り込む（関連記事）。省略時は新着順（最近の投稿）。
 * @param excludeId  表示中の記事を除外する
 * @param limit      取得件数
 */
export async function fetchLinkedPosts({
  categoryId,
  excludeId,
  limit,
}: {
  categoryId?: string;
  excludeId?: string;
  limit: number;
}): Promise<BlogListItem[]> {
  const config = getConfig();
  if (!config) return [];

  const json = await requestList(config, config.blogEndpoint, {
    fields: BLOG_LIST_FIELDS,
    orders: '-publishedAt',
    // 表示中の記事が含まれる場合に備えて 1 件多く取得し、除外後に limit 件へ切り詰める
    limit: String(limit + 1),
    ...(categoryId ? { filters: categoryFilter(categoryId) } : {}),
  });

  return json.contents
    .map(parseListItem)
    .filter((post): post is BlogListItem => post !== null && post.id !== excludeId)
    .slice(0, limit);
}

/** 記事詳細で「おすすめの記事」として表示する上限件数 */
export const RECOMMENDED_LIMIT = 3;

/**
 * 事業内容 API のエンドポイント名。
 * 環境変数が未設定なら README の手順どおりの API ID（services）を使う
 * （API を作るだけで動き、Vercel 側に環境変数を足さなくて済むようにするため）。
 */
const DEFAULT_SERVICES_ENDPOINT = 'services';

/**
 * 繰り返しフィールド（sections）の 1 要素を整形する。
 * 見出しが空のブロックは入力途中とみなして表示しない。
 */
function parseServiceSection(value: unknown): ServiceSection | null {
  if (!isRecord(value)) return null;
  const heading = getString(value.heading)?.trim();
  if (!heading) return null;

  return {
    heading,
    body: getString(value.body) ?? '',
    image: parseImage(value.image),
    imageAlt: getString(value.imageAlt)?.trim() ?? '',
  };
}

/**
 * 事業ごとの詳細ページの本文を microCMS から取得する。
 *
 * 取得できない場合（環境変数が未設定・API 未作成・コンテンツ未作成/下書き・通信障害）は
 * 例外を投げずに null を返す。呼び出し側（app/services/[id]/page.tsx）は null のとき
 * lib/services.ts の文章で仮表示するため、microCMS の状態に関わらずページは表示できる。
 * ※ API キーはブログと共通（MICROCMS_API_KEY）。ブログ用のエンドポイント設定には依存しない。
 */
export async function fetchServicePage(id: string): Promise<ServicePageContent | null> {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = process.env.MICROCMS_API_KEY?.trim();
  if (!serviceDomain || !apiKey) return null;

  const endpoint =
    normalizeEndpoint(process.env.MICROCMS_SERVICES_ENDPOINT) ?? DEFAULT_SERVICES_ENDPOINT;
  const url = new URL(
    `https://${normalizeServiceDomain(serviceDomain)}.microcms.io/api/v1/${endpoint}/${encodeURIComponent(id)}`,
  );
  url.searchParams.set('fields', 'lead,sections');

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': apiKey },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    console.error('[services] microCMS へのリクエストに失敗しました', error);
    return null;
  }

  // 404 は「API またはコンテンツがまだ無い（下書きのみを含む）」状態。仮表示にするだけなのでログは出さない。
  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(`[services] microCMS から事業内容を取得できませんでした（HTTP ${response.status}）`);
    return null;
  }

  const json: unknown = await response.json();
  if (!isRecord(json)) return null;

  const sections = (Array.isArray(json.sections) ? json.sections : [])
    .map(parseServiceSection)
    .filter((section): section is ServiceSection => section !== null);

  return {
    lead: getString(json.lead)?.trim() || undefined,
    sections,
  };
}

/** 便利ツール一覧の API のエンドポイント名（未設定なら README の手順どおりの API ID を使う） */
const DEFAULT_TOOLS_ENDPOINT = 'tools';
const DEFAULT_TOOL_CATEGORIES_ENDPOINT = 'tool-categories';

/**
 * 任意機能用に、リスト形式 API の contents を取得する。
 * API 未作成（404）や通信障害のときは例外を投げずに null を返す（ページ側で「準備中」を表示する）。
 */
async function fetchOptionalContents(
  logLabel: string,
  endpoint: string,
  searchParams: Record<string, string>,
): Promise<unknown[] | null> {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = process.env.MICROCMS_API_KEY?.trim();
  if (!serviceDomain || !apiKey) return null;

  const url = new URL(
    `https://${normalizeServiceDomain(serviceDomain)}.microcms.io/api/v1/${endpoint}`,
  );
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': apiKey },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    console.error(`[${logLabel}] microCMS へのリクエストに失敗しました`, error);
    return null;
  }

  // 404 は「API がまだ無い」状態。準備中の表示にするだけなのでログは出さない。
  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(`[${logLabel}] microCMS から取得できませんでした（HTTP ${response.status}）`);
    return null;
  }

  const json: unknown = await response.json();
  return isRecord(json) && Array.isArray(json.contents) ? json.contents : null;
}

/** セレクトフィールド（配列）・テキストのどちらでも、最初の文字列を取り出す */
function getFirstString(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return getString(first)?.trim() || undefined;
}

/** 公式サイトの URL。http / https 以外（javascript: など）は表示しない */
function parseExternalUrl(value: unknown): string | null {
  const raw = getString(value)?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * 分類の「関連する事業内容」を事業の id に変換する。
 * microCMS のセレクトの選択肢は、事業名（財務・資金 など）でも id（finance など）でもよい。
 */
function parseServiceId(value: unknown): ToolCategory['serviceId'] {
  const raw = getFirstString(value);
  if (!raw) return undefined;
  return SERVICES.find((service) => service.id === raw || service.title === raw)?.id;
}

function parseToolCategory(value: unknown): ToolCategory | null {
  if (!isRecord(value)) return null;
  const id = getString(value.id);
  const name = getString(value.name)?.trim();
  if (!id || !name) return null;

  return {
    id,
    name,
    description: getString(value.description)?.trim() || undefined,
    order: typeof value.order === 'number' ? value.order : undefined,
    serviceId: parseServiceId(value.service),
  };
}

function parseTool(value: unknown): Tool | null {
  if (!isRecord(value)) return null;
  const id = getString(value.id);
  const name = getString(value.name)?.trim();
  if (!id || !name) return null;

  const article = isRecord(value.article) ? value.article : null;
  const articleId = article ? getString(article.id) : undefined;
  const articleTitle = article ? getString(article.title) : undefined;

  return {
    id,
    name,
    url: parseExternalUrl(value.url),
    summary: getString(value.summary)?.trim() ?? '',
    pricing: getFirstString(value.pricing),
    detail: getString(value.detail) ?? '',
    article: articleId && articleTitle ? { id: articleId, title: articleTitle } : null,
    checkedAt: getString(value.checkedAt),
    order: typeof value.order === 'number' ? value.order : undefined,
    categoryId: isRecord(value.category) ? (getString(value.category.id) ?? null) : null,
  };
}

/** order の昇順（未入力は最後）→ 名前順 */
function compareByOrder(
  a: { order?: number; name: string },
  b: { order?: number; name: string },
): number {
  const orderA = a.order ?? Number.POSITIVE_INFINITY;
  const orderB = b.order ?? Number.POSITIVE_INFINITY;
  if (orderA !== orderB) return orderA - orderB;
  return a.name.localeCompare(b.name, 'ja');
}

/**
 * 便利ツール一覧（/tools）のデータを取得する。
 *
 * - ツール API が無い・取得できない場合は null（ページ側で「準備中」を表示）
 * - 分類 API が無い場合でも、ツール側の参照（category）から分類を組み立てて表示する
 * - 分類・ツールとも order（数値）の小さい順、同じなら名前順に並べる
 * ※ 1 回の取得上限は 100 件（microCMS の limit の上限）。超える場合はページングが必要。
 */
export async function fetchToolDirectory(): Promise<ToolDirectory | null> {
  const toolsEndpoint =
    normalizeEndpoint(process.env.MICROCMS_TOOLS_ENDPOINT) ?? DEFAULT_TOOLS_ENDPOINT;
  const categoriesEndpoint =
    normalizeEndpoint(process.env.MICROCMS_TOOL_CATEGORIES_ENDPOINT) ??
    DEFAULT_TOOL_CATEGORIES_ENDPOINT;

  const [toolContents, categoryContents] = await Promise.all([
    // category（分類）と article（ブログ記事）の参照を展開するため depth=1
    fetchOptionalContents('tools', toolsEndpoint, { limit: '100', depth: '1' }),
    fetchOptionalContents('tools', categoriesEndpoint, { limit: '100' }),
  ]);
  if (!toolContents) return null;

  const tools = toolContents
    .map(parseTool)
    .filter((tool): tool is Tool => tool !== null)
    .sort(compareByOrder);

  // 分類 API が使えればそれを正とし、無ければツール側の参照から拾う
  const categorySource =
    categoryContents ??
    toolContents.flatMap((content) =>
      isRecord(content) && isRecord(content.category) ? [content.category] : [],
    );
  const categoryMap = new Map<string, ToolCategory>();
  for (const category of categorySource.map(parseToolCategory)) {
    if (category && !categoryMap.has(category.id)) categoryMap.set(category.id, category);
  }

  return {
    categories: [...categoryMap.values()].sort(compareByOrder),
    tools,
  };
}

/** sitemap.xml 用に、公開中の記事の ID と最終更新日をまとめて取得する */
export async function fetchBlogSitemapEntries(): Promise<BlogSitemapEntry[]> {
  const config = getConfig();
  if (!config) return [];

  const json = await requestList(config, config.blogEndpoint, {
    fields: 'id,revisedAt,updatedAt,publishedAt',
    orders: '-publishedAt',
    // microCMS の limit の上限は 100。100 件を超える場合はページングが必要（要対応）。
    limit: '100',
  });

  return json.contents.flatMap((content) => {
    if (!isRecord(content)) return [];
    const id = getString(content.id);
    if (!id) return [];
    return [
      {
        id,
        lastModified:
          getString(content.revisedAt) ??
          getString(content.updatedAt) ??
          getString(content.publishedAt),
      },
    ];
  });
}
