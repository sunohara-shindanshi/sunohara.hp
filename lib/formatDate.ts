/**
 * ISO 8601 の日時文字列を「2026年1月5日」形式に整形する。
 * サーバー / クライアントで表示がずれないよう、タイムゾーンを固定する。
 */
export function formatJapaneseDate(isoDate: string): string | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  }).format(date);
}
