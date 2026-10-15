import Link from 'next/link';

import Container from '@/components/Container';
import CtaSection from '@/components/CtaSection';
import PageHeader from '@/components/PageHeader';
import ToolItem from '@/components/ToolItem';
import { buildPageMetadata } from '@/lib/metadata';
import { fetchToolDirectory } from '@/lib/microcms';
import { prepareRichTextFragment } from '@/lib/richText';
import { buildServiceHref, findService } from '@/lib/services';
import type { Tool, ToolCategory, ToolDirectory } from '@/types/tool';

export const metadata = buildPageMetadata({
  title: '便利ツール一覧',
  description:
    '中小企業の経営に役立つ無料のツールを分野別にまとめています。ツールごとに、できることや使い方、公式サイトへのリンクを掲載しています。',
  path: '/tools',
});

type ToolGroup = {
  category: ToolCategory;
  tools: { tool: Tool; detailHtml: string }[];
};

/** 各ツールの詳細（リッチエディタ）をサニタイズして、表示用のグループにする */
async function prepareGroups(directory: ToolDirectory): Promise<ToolGroup[]> {
  return Promise.all(
    directory.groups.map(async ({ category, tools }) => ({
      category,
      tools: await Promise.all(
        tools.map(async (tool) => ({
          tool,
          detailHtml: tool.detail ? await prepareRichTextFragment(tool.detail) : '',
        })),
      ),
    })),
  );
}

/**
 * 便利ツール一覧（/tools）。中身はすべて microCMS の tools API から取得する
 * （分類は tools の category セレクト。分類の並び順は lib/microcms.ts の compareToolCategories）。
 * API が未作成・取得失敗・ツール 0 件のときは「準備中」と表示する（ページ自体は出す）。
 */
export default async function ToolsPage() {
  const directory = await fetchToolDirectory();
  const groups = directory ? await prepareGroups(directory) : [];

  return (
    <>
      <PageHeader
        label="Tools"
        title="便利ツール一覧"
        description="中小企業の経営で使える無料のツールを、分野別にまとめました。ツール名をクリックすると、できることや使い方を確認できます。"
      />

      <section className="bg-brand-surface py-14 sm:py-20">
        <Container>
          {groups.length === 0 ? (
            <p className="text-sm leading-relaxed text-brand-ink sm:text-base">
              現在、掲載するツールを準備しています。公開まで今しばらくお待ちください。
            </p>
          ) : (
            <>
              {/* 分類へのページ内リンク（分類が 2 つ以上あるときだけ） */}
              {groups.length > 1 ? (
                <nav aria-label="分類から探す">
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    {groups.map(({ category }) => (
                      <li key={category.id}>
                        <a
                          href={`#tools-${category.id}`}
                          className="rounded font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                        >
                          {category.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}

              {/* 料金・機能は変わるため、確認日時点の情報であることを明記する */}
              <p className="mt-6 text-xs leading-relaxed text-brand-muted">
                ※ 料金や機能は、各ツールの「情報の確認日」時点のものです。最新の内容は公式サイトでご確認ください。
              </p>

              <div className="mt-10 space-y-14 sm:space-y-16">
                {groups.map(({ category, tools }) => {
                  const service = category.serviceId ? findService(category.serviceId) : undefined;

                  return (
                    <section
                      key={category.id}
                      id={`tools-${category.id}`}
                      aria-labelledby={`tools-${category.id}-heading`}
                      className="scroll-mt-28"
                    >
                      <h2
                        id={`tools-${category.id}-heading`}
                        className="font-display text-xl font-bold tracking-jp text-brand-navy sm:text-2xl"
                      >
                        {category.name}
                      </h2>

                      <ul className="mt-5 border-b border-brand-line">
                        {tools.map(({ tool, detailHtml }) => (
                          <ToolItem key={tool.id} tool={tool} detailHtml={detailHtml} />
                        ))}
                      </ul>

                      {/* 分類が事業内容の領域に対応していれば、その領域の詳細ページへ案内する */}
                      {service ? (
                        <p className="mt-4 text-sm text-brand-ink">
                          ツールの選び方や導入から相談したい場合は
                          <Link
                            href={buildServiceHref(service.id)}
                            className="mx-1 rounded font-medium text-brand-accent underline underline-offset-4 hover:text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                          >
                            {service.title}の支援
                          </Link>
                          をご覧ください。
                        </p>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            </>
          )}
        </Container>
      </section>

      <CtaSection
        heading="ツール選びや導入から相談できます"
        lead="どのツールが自社に合うか分からない、入れたものの使いこなせていない。そんな段階からでも構いません。業務の流れを伺い、合う形を一緒に考えます。"
        buttonLabel="ツールについて相談する"
      />
    </>
  );
}
