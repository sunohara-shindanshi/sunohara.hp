import type { ReactNode } from 'react';

import BrandMotif from '@/components/BrandMotif';

/** セクション見出し（英字ラベル + 日本語見出し + モチーフ罫線）。 */
export default function SectionHeading({
  label,
  children,
  align = 'left',
}: {
  /** 見出しの上に置く小さなラベル */
  label: string;
  children: ReactNode;
  align?: 'left' | 'center';
}) {
  const isCenter = align === 'center';

  return (
    <div className={isCenter ? 'text-center' : ''}>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-accent">{label}</p>
      <h2 className="mt-3 font-display text-2xl font-bold tracking-jp text-brand-navy sm:text-3xl">
        {children}
      </h2>
      <BrandMotif
        variant="rule"
        className={`mt-4 h-3 w-28 text-brand-accent ${isCenter ? 'mx-auto' : ''}`}
      />
    </div>
  );
}
