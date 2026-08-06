import { analyticsAttributes } from '@/lib/analytics/attributes';
import { CTA_LOCATIONS } from '@/lib/analytics/ctaNames';
import { SOCIAL_LINKS } from '@/lib/siteConfig';

/**
 * 代表者の外部発信（note / X など）へのリンク。
 *
 * 表示するリンクは lib/siteConfig.ts の SOCIAL_LINKS が唯一の参照元。
 * URL が未設定（null）のものは表示しないため、すべて未設定なら何も描画しない。
 * SNS を増やすときは SOCIAL_LINKS に 1 行足すだけでよく、このファイルの修正は不要。
 *
 * クリックは cta_click として計測される（cta_name は SOCIAL_LINKS の ctaName）。
 * 外部ドメインのため、data 属性が無くても external_link_click として拾われるが、
 * 「プロフィールからの導線」を明示的に区別したいので cta_click を優先させている。
 */
export default function SocialLinks({ className = '' }: { className?: string }) {
  const links = SOCIAL_LINKS.filter(
    (link): link is (typeof SOCIAL_LINKS)[number] & { url: string } => Boolean(link.url),
  );

  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            {...analyticsAttributes('cta_click', {
              cta_name: link.ctaName,
              cta_location: CTA_LOCATIONS.PROFILE,
              link_url: link.url,
            })}
            className="inline-flex items-center gap-1 rounded-full border border-brand-navy px-5 py-2.5 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            {link.label}
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
