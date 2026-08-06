import {
  ANALYTICS_EVENTS,
  BOOLEAN_PARAM_KEYS,
  NUMERIC_PARAM_KEYS,
  type AnalyticsEventName,
  type AnalyticsEventParamsMap,
} from '@/lib/analytics/events';

/**
 * HTML の data 属性による計測の指定。
 *
 * リンクやボタンに data-analytics-event / data-analytics-<パラメータ名> を付けておくと、
 * クリック時に AnalyticsProvider のイベント委譲（useLinkTracking）が拾って送信する。
 * 個々のコンポーネントに onClick を書く必要がないため、
 * CTA やリンクが増えても計測用のコードを書き足さずに済む。
 *
 * 例）
 *   <Link href="/contact" {...analyticsAttributes('cta_click', { cta_name: 'header_contact' })}>
 */

const ATTRIBUTE_PREFIX = 'data-analytics-';
const EVENT_ATTRIBUTE = `${ATTRIBUTE_PREFIX}event`;

/** パラメータ名（snake_case）を data 属性名（kebab-case）に変換する */
function toAttributeName(paramName: string): string {
  return `${ATTRIBUTE_PREFIX}${paramName.replace(/_/g, '-')}`;
}

/** data 属性名（kebab-case）をパラメータ名（snake_case）に戻す */
function toParamName(attributeName: string): string {
  return attributeName.slice(ATTRIBUTE_PREFIX.length).replace(/-/g, '_');
}

/**
 * 計測用の data 属性一式を作る（JSX にスプレッドして使う）。
 * イベント名とパラメータの組み合わせは AnalyticsEventParamsMap で型チェックされる。
 */
export function analyticsAttributes<E extends AnalyticsEventName>(
  event: E,
  params: AnalyticsEventParamsMap[E],
): Record<string, string> {
  const attributes: Record<string, string> = { [EVENT_ATTRIBUTE]: event };

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    // 未設定（undefined / null / 空文字）のパラメータは属性ごと出力しない
    if (value === undefined || value === null || value === '') continue;
    attributes[toAttributeName(key)] = String(value);
  }

  return attributes;
}

/** data 属性から読み取った計測指定 */
export type ParsedAnalyticsAttributes = {
  event: AnalyticsEventName;
  params: Record<string, string | number | boolean>;
};

const KNOWN_EVENT_NAMES = new Set<string>(Object.values(ANALYTICS_EVENTS));

/**
 * 属性値（文字列）を本来の型に戻す。
 * HTML の属性は必ず文字列になるため、数値・真偽値のパラメータだけ型を復元し、
 * コードから直接送るイベントと同じ型で dataLayer に載せる。
 */
function restoreValueType(paramName: string, value: string): string | number | boolean {
  if (NUMERIC_PARAM_KEYS.has(paramName)) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value;
  }
  if (BOOLEAN_PARAM_KEYS.has(paramName)) {
    return value === 'true';
  }
  return value;
}

/**
 * 要素に付いた data-analytics-* を読み取る。
 * 定義済みのイベント名でない場合は null を返す（タイプミスを黙って送らない）。
 */
export function readAnalyticsAttributes(element: Element): ParsedAnalyticsAttributes | null {
  const event = element.getAttribute(EVENT_ATTRIBUTE);
  if (!event || !KNOWN_EVENT_NAMES.has(event)) return null;

  const params: Record<string, string | number | boolean> = {};
  for (const attribute of Array.from(element.attributes)) {
    if (!attribute.name.startsWith(ATTRIBUTE_PREFIX) || attribute.name === EVENT_ATTRIBUTE) {
      continue;
    }
    const paramName = toParamName(attribute.name);
    params[paramName] = restoreValueType(paramName, attribute.value);
  }

  return { event: event as AnalyticsEventName, params };
}

/** イベント委譲でクリック対象を探すためのセレクタ */
export const ANALYTICS_ELEMENT_SELECTOR = `[${EVENT_ATTRIBUTE}]`;
