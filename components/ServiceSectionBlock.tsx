import Image from 'next/image';

import RichText from '@/components/RichText';
import type { MicroCMSImage } from '@/types/blog';

/**
 * 事業ごとの詳細ページ（/services/{id}）の「やること」1 ブロック。
 *
 * - PC：画像と文章を横並びにし、ブロックごとに画像の左右を入れ替える（index が奇数なら画像が右）
 * - スマホ：画像 → 文章の縦並び
 * - 画像が無いブロックは文章だけを読みやすい幅で表示する
 * 角丸・影・背景色の囲みは付けず、上端の罫線だけで区切る（角丸カードの多用を避ける方針）。
 */
export default function ServiceSectionBlock({
  index,
  heading,
  bodyHtml,
  image,
  imageAlt,
}: {
  index: number;
  heading: string;
  /** lib/richText.ts の prepareRichTextFragment を通したサニタイズ済み HTML */
  bodyHtml: string;
  image: MicroCMSImage | null;
  imageAlt: string;
}) {
  const headingBlock = (
    <>
      <p className="font-display text-sm text-brand-accent">{String(index + 1).padStart(2, '0')}</p>
      <h2 className="mt-2 font-display text-xl font-bold tracking-jp text-brand-navy sm:text-2xl">
        {heading}
      </h2>
    </>
  );

  const body = bodyHtml ? (
    <div className="mt-5">
      <RichText sanitizedHtml={bodyHtml} />
    </div>
  ) : null;

  if (!image) {
    return (
      <section className="border-t border-brand-line py-12 first:border-t-0 first:pt-0 sm:py-16">
        <div className="max-w-3xl">
          {headingBlock}
          {body}
        </div>
      </section>
    );
  }

  const imageOnRight = index % 2 === 1;

  return (
    <section className="grid gap-8 border-t border-brand-line py-12 first:border-t-0 first:pt-0 sm:py-16 md:grid-cols-2 md:items-center md:gap-12">
      <div className={imageOnRight ? 'md:order-2' : undefined}>
        <Image
          src={image.url}
          alt={imageAlt}
          width={image.width}
          height={image.height}
          // Container の最大幅の半分程度で表示されるため、PC では 50vw（上限 600px 相当）で十分
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
          className="h-auto w-full"
        />
      </div>
      <div>
        {headingBlock}
        {body}
      </div>
    </section>
  );
}
