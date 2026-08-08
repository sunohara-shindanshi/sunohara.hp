import Link from 'next/link';

import BlogCard from '@/components/BlogCard';
import BrandMotif from '@/components/BrandMotif';
import Container from '@/components/Container';
import CtaSection from '@/components/CtaSection';
import JsonLd from '@/components/JsonLd';
import PrimaryCta from '@/components/PrimaryCta';
import SectionHeading from '@/components/SectionHeading';
import ServiceCard from '@/components/ServiceCard';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_LOCATIONS, CTA_NAMES } from '@/lib/analytics/ctaNames';
import { buildPageMetadata } from '@/lib/metadata';
import { fetchLinkedPosts } from '@/lib/microcms';
import { SERVICES } from '@/lib/services';
import { SITE_URL, siteConfig, telHref } from '@/lib/siteConfig';
import type { BlogListItem } from '@/types/blog';

/**
 * トップページの説明文。
 *
 * 屋号・代表者名を先頭付近に置いている。氏名（「春原功貴」「すのはら」）で検索されたとき、
 * この説明文がクエリに答えていないと、Google はページ本文から別のテキストを拾って
 * 検索スニペットを作ってしまうため（実際に「最近のブログ」の記事抜粋が使われていた）。
 * あわせて、一覧カードの抜粋には data-nosnippet を付けてスニペット候補から外している
 * （components/BlogCard.tsx）。
 * ※ スマートフォンでは 50 文字程度で切られるため、重要な情報ほど前に置くこと。
 * ※ 代表者名は姓名の間の空白を詰める。検索されるのは「春原功貴」（空白なし）のため、
 *   表示用の表記（春原 功貴）のままだと検索語と文字列が一致しない。
 */
const REPRESENTATIVE_NAME_FOR_SEARCH = siteConfig.representative.name.replace(/\s+/g, '');

export const metadata = buildPageMetadata({
  title: 'ホーム',
  description: `（代表：${REPRESENTATIVE_NAME_FOR_SEARCH}／中小企業診断士）。「${siteConfig.catchphrase}」を掲げ、財務・資金、組織・人事、営業・売上、IT・システムの4領域を現場で支援します。`,
  path: '/',
});

/**
 * 構造化データ（ProfessionalService）。
 * 表記は lib/siteConfig.ts / lib/services.ts と同一のものを参照し、直書きしない。
 * ※ schema.org に実在するプロパティのみを使用している（slogan / address / telephone / hasOfferCatalog）。
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: siteConfig.name,
  slogan: siteConfig.catchphrase,
  description: siteConfig.description,
  url: SITE_URL,
  telephone: siteConfig.tel,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'JP',
    addressRegion: siteConfig.address.region,
    addressLocality: siteConfig.address.locality,
    streetAddress: siteConfig.address.street,
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: '事業内容',
    itemListElement: SERVICES.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service.title,
        description: service.description,
      },
    })),
  },
};

const APPROACHES = [
  {
    title: '現場に足を運ぶ',
    body: '会議室の資料だけでは、事業の本当の課題は見えません。工場・店舗・バックヤードに入り、実際の作業と数字のズレを確認したうえで打ち手を組み立てます。',
  },
  {
    title: '実行できる形にする',
    body: '計画は作って終わりではありません。誰が・いつ・何をするかまで分解し、社内で回せる粒度まで落とし込みます。',
  },
  {
    title: '数字で振り返る',
    body: '資金繰り表や業務の処理件数など、変化が見える指標を決めて定点観測します。効果が出ない打ち手は早めに見直します。',
  },
];

/** トップページに載せる最近のブログの件数 */
const RECENT_POSTS_LIMIT = 3;

/**
 * 最近のブログを取得する。
 * microCMS が未設定・障害中でもトップページ自体は表示できるよう、失敗時は空配列を返す
 * （セクションごと非表示になる）。
 */
async function getRecentPosts(): Promise<BlogListItem[]> {
  try {
    return await fetchLinkedPosts({ limit: RECENT_POSTS_LIMIT });
  } catch (error) {
    console.error('[home] 最近のブログの取得に失敗しました', error);
    return [];
  }
}

export default async function HomePage() {
  const recentPosts = await getRecentPosts();

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ヒーロー：屋号とキャッチフレーズを最も目立つ位置に置く */}
      <section className="relative overflow-hidden bg-sky text-brand-ink">
        {/* 陽ざしと雲間の光（装飾。文字が乗らない位置にだけ置く） */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-sun/50 blur-3xl sm:h-96 sm:w-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-4 h-80 w-80 rounded-full bg-white/60 blur-3xl"
        />
        <BrandMotif
          variant="hero"
          className="pointer-events-none absolute inset-0 h-full w-full text-brand-accent opacity-20"
        />
        <Container className="relative py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="font-display text-base tracking-jp text-brand-accent sm:text-lg">
              {siteConfig.name}
            </p>
            {/* キャッチフレーズは信頼感を出すため、丸ゴシックではなく明朝体（font-mincho）で表示する */}
            <h1 className="mt-4 font-mincho text-[2.75rem] font-bold leading-tight tracking-jp text-brand-navy sm:text-6xl lg:text-7xl">
              {siteConfig.catchphrase}
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-loose text-brand-ink sm:text-base">
口だけでは、会社は変わらない。

私たちが大切にしているのは「{siteConfig.catchphrase}」。提案して終わりではなく、現場に入り込み、実行まで一緒に手を動かします。財務・資金、組織・人事、営業・売上、IT・システム。会社全体を見ながら、御社が自走できる状態を目指して支援します。
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryCta
                href="/contact"
                ctaName={CTA_NAMES.HERO_CONTACT}
                ctaLocation={CTA_LOCATIONS.HERO}
              >
                まずは現状を相談する
              </PrimaryCta>
              <Link
                href="/services"
                className="inline-flex justify-center rounded-full border border-brand-navy bg-white/70 px-7 py-4 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                事業内容を見る
              </Link>
            </div>
            <p className="mt-6 text-sm text-brand-ink">
              お電話でのご相談：
              <a
                href={telHref}
                {...analyticsAttributes('cta_click', {
                  cta_name: CTA_NAMES.HERO_TEL,
                  cta_location: CTA_LOCATIONS.HERO,
                  link_url: telHref,
                })}
                className="rounded font-medium text-brand-navy underline underline-offset-4 hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
              >
                {siteConfig.tel}
              </a>
            </p>
          </div>
        </Container>
      </section>

      {/* 最近のブログ（ファーストビューのすぐ下） */}
      {recentPosts.length > 0 ? (
        <section className="py-14 sm:py-20">
          <Container>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading label="Blog">最近のブログ</SectionHeading>
              <Link
                href="/blog"
                className="inline-flex shrink-0 justify-center rounded-full border border-brand-navy px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
              >
                もっと見る
              </Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  {/* list_name でトップページ経由の記事クリックを区別する */}
                  <BlogCard post={post} listName="home_recent" />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* 事業内容 */}
      <section className="border-t border-brand-line py-16 sm:py-24">
        <Container>
          <SectionHeading label="Services">事業内容</SectionHeading>
          <p className="mt-6 max-w-2xl text-sm leading-loose text-brand-ink sm:text-base">
            お金・人・売上・仕組みの4つの領域から、いまの経営状況に合わせて必要な支援を組み合わせます。
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/services"
              className="inline-flex rounded-full border border-brand-navy px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              事業内容の詳細
            </Link>
          </div>
        </Container>
      </section>

      {/* 支援の進め方 */}
      <section className="border-y border-brand-line bg-brand-surface py-16 sm:py-24">
        <Container>
          <SectionHeading label="Approach">
            「{siteConfig.catchphrase}」の進め方
          </SectionHeading>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {APPROACHES.map((approach, index) => (
              <div key={approach.title} className="border-t border-brand-accentsoft pt-6">
                <p className="font-display text-sm text-brand-accent">
                  Step {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 font-display text-lg font-bold tracking-jp text-brand-navy">
                  {approach.title}
                </h3>
                <p className="mt-3 text-sm leading-loose text-brand-ink">{approach.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-brand-muted">
            事務所の基本情報と代表者の考え方は
            <Link
              href="/about"
              className="mx-1 rounded font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              基本情報
            </Link>
            ページ、日々の支援で気づいたことは
            <Link
              href="/blog"
              className="mx-1 rounded font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            >
              ブログ
            </Link>
            でご紹介しています。
          </p>
        </Container>
      </section>

      {/* お問い合わせ導線（コンテンツを読み終えた後の CTA） */}
      <CtaSection
        heading="まずは現状をお聞かせください"
        lead="「何から手を付けるべきか分からない」という段階でも構いません。財務・人・売上・仕組みのどの課題からでも、会社全体を見ながら一緒に考えます。"
        buttonLabel="現状を相談する"
      />
    </>
  );
}
