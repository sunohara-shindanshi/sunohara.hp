import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Container from '@/components/Container';
import CtaSection from '@/components/CtaSection';
import JsonLd from '@/components/JsonLd';
import PageHeader from '@/components/PageHeader';
import ServiceSectionBlock from '@/components/ServiceSectionBlock';
import { CTA_NAMES } from '@/lib/analytics/ctaNames';
import { buildPageMetadata } from '@/lib/metadata';
import { fetchServicePage } from '@/lib/microcms';
import { prepareRichTextFragment } from '@/lib/richText';
import { SERVICES, buildServiceHref, findService } from '@/lib/services';
import { SITE_URL, siteConfig } from '@/lib/siteConfig';

type ServiceDetailProps = {
  params: Promise<{ id: string }>;
};

/**
 * 事業ごとの詳細ページ（/services/finance など）。
 *
 * - ページの一覧は lib/services.ts の SERVICES で固定（microCMS 側で事業を増やしてもページは増えない）
 * - 本文（冒頭の説明文・「やること」のブロック）は microCMS の「事業内容」API から取得する
 * - microCMS に未入力・取得失敗のときは lib/services.ts の文章で仮表示する
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ id: service.id }));
}

export async function generateMetadata({ params }: ServiceDetailProps): Promise<Metadata> {
  const { id } = await params;
  const service = findService(id);
  if (!service) return {};

  const content = await fetchServicePage(service.id);
  return buildPageMetadata({
    title: `${service.title}の支援`,
    // 冒頭の説明文をそのまま使う（改行はメタタグ向けに空白へ正規化）
    description: (content?.lead ?? service.detail).replace(/\s+/g, ' ').trim(),
    path: buildServiceHref(service.id),
  });
}

export default async function ServiceDetailPage({ params }: ServiceDetailProps) {
  const { id } = await params;
  const service = findService(id);
  if (!service) notFound();

  const content = await fetchServicePage(service.id);
  const lead = content?.lead ?? service.detail;
  const sections = await Promise.all(
    (content?.sections ?? []).map(async (section) => ({
      ...section,
      bodyHtml: section.body ? await prepareRichTextFragment(section.body) : '',
    })),
  );
  const otherServices = SERVICES.filter((other) => other.id !== service.id);
  const pageUrl = `${SITE_URL}${buildServiceHref(service.id)}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '事業内容', item: `${SITE_URL}/services` },
      { '@type': 'ListItem', position: 3, name: service.title, item: pageUrl },
    ],
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: lead,
    url: pageUrl,
    provider: { '@type': 'ProfessionalService', name: siteConfig.name, url: SITE_URL },
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={serviceJsonLd} />

      <PageHeader
        breadcrumbs={[
          { label: 'ホーム', href: '/' },
          { label: '事業内容', href: '/services' },
          { label: service.title },
        ]}
        label="Services"
        title={service.title}
        subtitle={`（${service.subtitle}）`}
        description={lead}
        cta={{ label: `${service.title}について相談する`, href: '/contact' }}
      />

      {/* やること（microCMS の繰り返しフィールド）。白地。 */}
      <section className="bg-brand-surface py-14 sm:py-20">
        <Container>
          {sections.length > 0 ? (
            <div>
              {sections.map((section, index) => (
                <ServiceSectionBlock
                  key={`${index}-${section.heading}`}
                  index={index}
                  heading={section.heading}
                  bodyHtml={section.bodyHtml}
                  image={section.image}
                  imageAlt={section.imageAlt}
                />
              ))}
            </div>
          ) : (
            // microCMS に未入力の間の仮表示：一覧と同じ支援メニューを罫線区切りで並べる
            <div className="max-w-3xl">
              <h2 className="font-display text-xl font-bold tracking-jp text-brand-navy sm:text-2xl">
                主な支援内容
              </h2>
              <ul className="mt-6">
                {service.points.map((point, index) => (
                  <li
                    key={point}
                    className="flex gap-4 border-t border-brand-line py-4 text-sm text-brand-ink last:border-b sm:text-base"
                  >
                    <span className="font-display text-brand-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      {/* ほかの事業内容（内部リンク）。水色地にして、前の白いセクションと縞模様を作る */}
      <section className="border-t border-brand-line bg-brand-bg py-14 sm:py-20">
        <Container>
          <h2 className="font-display text-xl font-bold tracking-jp text-brand-navy sm:text-2xl">
            ほかの事業内容
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-3">
            {otherServices.map((other) => (
              <li key={other.id} className="border-t border-brand-accentsoft pt-5">
                <Link
                  href={buildServiceHref(other.id)}
                  className="group rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
                >
                  <span className="font-display text-lg font-bold tracking-jp text-brand-navy underline-offset-4 group-hover:text-brand-accent group-hover:underline">
                    {other.title}
                  </span>
                  <span className="mt-1 block text-xs text-brand-muted">（{other.subtitle}）</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/services"
            className="mt-10 inline-flex rounded-full border border-brand-navy px-6 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            事業内容の一覧へ
          </Link>
        </Container>
      </section>

      <CtaSection
        heading={`${service.title}のご相談はこちらから`}
        lead="まだ課題がはっきりしていない段階でも構いません。現状を伺い、何から手を付けるかを一緒に整理します。"
        buttonLabel={`${service.title}について相談する`}
        ctaName={CTA_NAMES.SERVICE_DETAIL_CONTACT}
      />
    </>
  );
}
