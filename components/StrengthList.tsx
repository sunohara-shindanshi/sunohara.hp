import Image from 'next/image';

import { STRENGTHS, getStrengthIllustration } from '@/lib/strengths';

/**
 * トップページ「当社の特徴」の一覧。
 *
 * 事業内容の一覧（components/ServiceListItem.tsx）と同じく、角丸・影・背景の囲みは付けず、
 * 上端の罫線だけで項目を区切る。
 * イラストは public/strengths/{id}.拡張子 を置くと自動的に表示される（無ければ文字だけ）。
 * ファイルシステムを見るため Server Component のままにすること（'use client' を付けない）。
 */
export default function StrengthList() {
  return (
    <ol className="grid gap-x-10 gap-y-10 md:grid-cols-3">
      {STRENGTHS.map((strength, index) => {
        const illustration = getStrengthIllustration(strength.id);

        return (
          <li key={strength.id} className="border-t border-brand-accentsoft pt-6">
            {illustration ? (
              <div className="relative mb-4 h-24 w-24">
                <Image src={illustration} alt="" fill sizes="96px" className="object-contain" />
              </div>
            ) : null}
            <p className="font-display text-sm text-brand-accent">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold leading-snug tracking-jp text-brand-navy">
              {/*
                「、」で区切った語句ごとに inline-block にし、折り返すなら「、」の後だけにする。
                そのままだと PC の 3 列表示で「まと／めて」のように語の途中で改行されるため。
              */}
              {strength.title.split(/(?<=、)/).map((phrase) => (
                <span key={phrase} className="inline-block">
                  {phrase}
                </span>
              ))}
            </h3>
            <p className="mt-3 text-sm leading-loose text-brand-ink">{strength.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
