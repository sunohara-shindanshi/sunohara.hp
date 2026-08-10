import Image from 'next/image';
import Link from 'next/link';

import BrandMotif from '@/components/BrandMotif';
import Container from '@/components/Container';
import CtaSection from '@/components/CtaSection';
import PageHeader from '@/components/PageHeader';
import SectionHeading from '@/components/SectionHeading';
import SocialLinks from '@/components/SocialLinks';
import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_LOCATIONS, CTA_NAMES } from '@/lib/analytics/ctaNames';
import { buildPageMetadata } from '@/lib/metadata';
import { SERVICES } from '@/lib/services';
import { siteConfig, telHref } from '@/lib/siteConfig';

export const metadata = buildPageMetadata({
  title: '基本情報',
  description: `${siteConfig.name}（代表：${siteConfig.representative.name}）の事務所概要と、代表者からのご挨拶を掲載しています。所在地は${siteConfig.address.full}。ご相談はお問い合わせフォームから承ります。`,
  path: '/about',
});

/**
 * 事務所概要テーブルの行。値は lib/siteConfig.ts / lib/services.ts から参照する。
 * 電話番号は非掲載（siteConfig.tel が null）の間は行ごと出さない。
 */
const OFFICE_INFO: readonly { label: string; value: string }[] = [
  { label: '屋号', value: siteConfig.name },
  { label: 'キャッチフレーズ', value: siteConfig.catchphrase },
  { label: '代表者', value: `${siteConfig.representative.name}（${siteConfig.representative.title}）` },
  { label: '所在地', value: siteConfig.address.full },
  ...(siteConfig.tel ? [{ label: '電話番号', value: siteConfig.tel }] : []),
  { label: 'お問い合わせ', value: 'お問い合わせフォームより承ります' },
  { label: '事業内容', value: SERVICES.map((service) => service.title).join('／') },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="About"
        title="基本情報"
        description="事務所の概要と、代表者としての考え方をご紹介します。ご相談前に、どのような姿勢で支援しているかを知っていただければ幸いです。"
        cta={{ label: '代表に相談する', href: '/contact' }}
      />

      {/* 代表者挨拶 */}
      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading label="Message">代表者挨拶</SectionHeading>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6 text-sm leading-loose text-brand-ink sm:text-base">
              {/* 代表者の顔写真（アイキャッチ）。本文の右に回り込ませて大きく表示する。
                  未設定（image が null）の間はプレースホルダー。next/image 経由なので JPEG/PNG でも WebP 配信。 */}
              <figure className="mx-auto mb-2 w-full max-w-[16rem] sm:float-right sm:ml-8 sm:mb-4 sm:w-64">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-brand-line bg-brand-bg shadow-panel">
                  {siteConfig.representative.image ? (
                    <Image
                      src={siteConfig.representative.image}
                      alt={`${siteConfig.representative.name}の写真`}
                      fill
                      sizes="(min-width: 640px) 16rem, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <BrandMotif variant="mark" className="h-12 w-12 text-brand-accentsoft" />
                    </span>
                  )}
                </div>
              </figure>
              <p>「なんでもできるは、何もできない」</p>
              <p>こんな言葉を、一度は耳にしたことがあるかもしれません。「専門性がない」「尖った強みがない」——確かに、世の中でこの言葉が使われるとき、多くはそういった意味を指しています。専門性を突き詰めることには、それだけの価値があるからです。</p>
              <p>しかし、数多くの中小企業を支援してきた中で、私が強く感じたことは、</p>

              <p>「なんでもできるからこそ、価値がある」</p>
              <p>中小企業を取り巻く問題は必ず複数あります。資金繰りの問題、ITの問題、組織の問題、営業の問題、人の問題……それぞれが独立して存在しているわけではなく、互いに影響し合いながら、今の状況を作り出しています。</p>
              <p>そんな経営の現場に対して、一つの専門分野しか扱えないコンサルタントに、本当に相談できるでしょうか。得意分野の話になると途端に饒舌になるのに、それ以外の相談をした瞬間、急に歯切れが悪くなり、机上の空論しか返ってこない。そんなもどかしさを感じたことがある社長も、少なくないはずです。</p>
              <p>これまで私は、バックオフィス業務の再構築から、営業の仕組みづくり、業務効率化、システム開発まで、幅広い領域で実務に携わってきました。それは、複数の課題にまたがる経営の現場に、本気で向き合うためです。</p>
              <p>そして大切にしているのが「超・現場主義」。どれだけ知識があっても、口だけでは会社は変わりません。現場に入り込み、手を動かしながら、実行できる形に落とし込む。それが私の役割だと考えています。</p>
              <p>一人で抱え込む必要はありません。どんな課題からでも構いませんので、まずは今の状況を聞かせてください。会社全体を見ながら、一緒に手を動かしていきます。</p>

              <p className="clear-both pt-2 text-brand-navy">
                {siteConfig.name}
                <br />
                <span className="font-display text-lg font-bold tracking-jp">
                  {siteConfig.representative.title}　{siteConfig.representative.name}
                </span>
              </p>

              {/* 代表者からの導線（お問い合わせ / 外部発信）。
                  SNS は lib/siteConfig.ts の SOCIAL_LINKS に URL を入れると自動で表示される。 */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/contact"
                  {...analyticsAttributes('cta_click', {
                    cta_name: CTA_NAMES.PROFILE_CONTACT,
                    cta_location: CTA_LOCATIONS.PROFILE,
                    link_url: '/contact',
                  })}
                  className="inline-flex rounded-full bg-brand-sun px-6 py-3 text-sm font-bold text-brand-navy shadow-panel transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                >
                  代表に相談する
                </Link>
                <SocialLinks />
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-brand-line bg-brand-surface p-7 shadow-panel">
              <BrandMotif variant="mark" className="h-9 w-9 text-brand-accent" />
              <p className="mt-4 font-display text-lg font-bold tracking-jp text-brand-navy">
                支援できること
              </p>
              <ul className="mt-4 space-y-4 text-sm leading-relaxed text-brand-ink">
                {SERVICES.map((service) => (
                  <li key={service.id}>
                    <p className="font-medium text-brand-navy">
                      {service.title}
                      <span className="ml-1 text-xs font-normal text-brand-muted">
                        （{service.subtitle}）
                      </span>
                    </p>
                    <p className="mt-1 text-brand-muted">{service.description}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/services"
                className="mt-6 inline-flex rounded-full border border-brand-navy px-5 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
              >
                事業内容を見る
              </Link>
            </aside>
          </div>
        </Container>
      </section>

      {/* 事務所概要 */}
      <section className="border-t border-brand-line bg-brand-surface py-14 sm:py-20">
        <Container>
          <SectionHeading label="Office">事務所概要</SectionHeading>
          <div className="mt-10 overflow-hidden rounded-2xl border border-brand-line">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {OFFICE_INFO.map((row) => (
                  <tr key={row.label} className="border-b border-brand-line last:border-b-0">
                    <th
                      scope="row"
                      className="w-32 bg-brand-bg px-4 py-4 align-top font-medium text-brand-navy sm:w-48 sm:px-6"
                    >
                      {row.label}
                    </th>
                    <td className="px-4 py-4 align-top leading-relaxed text-brand-ink sm:px-6">
                      {row.label === '電話番号' && telHref ? (
                        <a
                          href={telHref}
                          className="rounded text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                        >
                          {row.value}
                        </a>
                      ) : row.label === 'お問い合わせ' ? (
                        <Link
                          href="/contact"
                          className="rounded text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                        >
                          {row.value}
                        </Link>
                      ) : (
                        row.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-sm text-brand-muted">
            日々の支援で気づいたことは
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

      {/* コンテンツを読み終えた後の CTA */}
      <CtaSection
        heading="代表と直接、話してみませんか"
        lead="考え方に共感いただけたら、まずは一度お話しさせてください。どんな課題からでも構いません。会社全体を見ながら、一緒に手を動かします。"
        buttonLabel="代表に相談する"
      />
    </>
  );
}
