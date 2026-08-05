import Link from 'next/link';

import Container from '@/components/Container';
import { NAV_ITEMS } from '@/lib/siteConfig';

/** 404 ページ（Next.js のファイル規約）。 */
export default function NotFound() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <p className="font-display text-sm tracking-[0.22em] text-brand-accent">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-jp text-brand-navy">
          ページが見つかりませんでした
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-loose text-brand-ink">
          お探しのページは移動または削除された可能性があります。
          以下のページからお探しください。
        </p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex rounded-full border border-brand-navy px-5 py-3 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
