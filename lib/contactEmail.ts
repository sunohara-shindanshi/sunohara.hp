import { siteConfig } from '@/lib/siteConfig';
import type { ContactFieldName } from '@/types/contact';

/** 通知メールに載せる項目のラベル（表示順もこの順） */
const FIELD_LABELS: { key: ContactFieldName; label: string }[] = [
  { key: 'name', label: 'お名前' },
  { key: 'company', label: '会社名・屋号' },
  { key: 'email', label: 'メールアドレス' },
  { key: 'tel', label: '電話番号' },
  { key: 'subject', label: 'ご相談内容' },
  { key: 'message', label: 'お問い合わせ内容' },
];

/** HTML メール用に、ユーザー入力を必ずエスケープする（HTML インジェクション対策） */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * お問い合わせ通知メールの件名・本文（テキスト / HTML）を組み立てる。
 * ※ 値は必ずここでエスケープしてから HTML に埋め込む。
 */
export function buildContactEmail(values: Record<ContactFieldName, string>) {
  const submittedAt = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  }).format(new Date());

  const subject = `【お問い合わせ】${values.subject || 'ご相談'} - ${values.name}様`;

  const rows = FIELD_LABELS.map(({ key, label }) => ({
    label,
    value: values[key] || '（未入力）',
  }));

  const text = [
    `${siteConfig.name} のお問い合わせフォームから送信がありました。`,
    '',
    ...rows.map((r) => `■ ${r.label}\n${r.value}`),
    '',
    `受信日時：${submittedAt}`,
  ].join('\n');

  const html = `<!doctype html><html lang="ja"><body style="font-family:sans-serif;line-height:1.7;color:#26313F;">
<p>${escapeHtml(siteConfig.name)} のお問い合わせフォームから送信がありました。</p>
<table style="border-collapse:collapse;width:100%;max-width:640px;">
${rows
  .map(
    (r) =>
      `<tr><th style="text-align:left;vertical-align:top;padding:8px 12px;background:#F1F6FB;border:1px solid #DCE7F1;white-space:nowrap;">${escapeHtml(
        r.label,
      )}</th><td style="padding:8px 12px;border:1px solid #DCE7F1;white-space:pre-wrap;">${escapeHtml(
        r.value,
      )}</td></tr>`,
  )
  .join('\n')}
</table>
<p style="color:#5A6B7D;font-size:12px;">受信日時：${escapeHtml(submittedAt)}</p>
</body></html>`;

  return { subject, text, html };
}
