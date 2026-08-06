'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useAnalytics } from '@/components/analytics/context';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

/**
 * フォームの計測（form_view / form_start / form_submit）。
 *
 * - form_view  : フォームが画面内に入った時点で 1 回だけ（IntersectionObserver）
 * - form_start : 最初の入力操作のときだけ 1 回（2 回目以降の入力では送らない）
 * - form_submit: 送信「成功」時に呼び出し側から trackSubmit() を実行する
 *                （バリデーションエラーは成功ではないため送らない）
 *
 * 使い方：
 * ```tsx
 * const { formRef, handleInput, trackSubmit } = useFormTracking('contact');
 * <form ref={formRef} onInput={handleInput}> … </form>
 * ```
 */
export function useFormTracking(formName: string) {
  const { trackEvent } = useAnalytics();
  const formRef = useRef<HTMLFormElement>(null);
  const hasSentView = useRef(false);
  const hasSentStart = useRef(false);
  const hasSentSubmit = useRef(false);

  // 表示（form_view）
  useEffect(() => {
    const element = formRef.current;
    if (!element || hasSentView.current) return;

    // IntersectionObserver 非対応環境では、表示された時点で送る
    if (typeof IntersectionObserver === 'undefined') {
      hasSentView.current = true;
      trackEvent(ANALYTICS_EVENTS.FORM_VIEW, { form_name: formName });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        if (!hasSentView.current) {
          hasSentView.current = true;
          trackEvent(ANALYTICS_EVENTS.FORM_VIEW, { form_name: formName });
        }
        observer.disconnect();
      },
      // フォームの一部でも見えたら「表示された」とみなす
      { threshold: 0 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [formName, trackEvent]);

  /** 入力開始（form_start）。form 要素の onInput / onChange に渡す。 */
  const handleInput = useCallback(() => {
    if (hasSentStart.current) return;
    hasSentStart.current = true;
    trackEvent(ANALYTICS_EVENTS.FORM_START, { form_name: formName });
  }, [formName, trackEvent]);

  /** 送信成功（form_submit）。同じ画面での連投を避けるため 1 回だけ送る。 */
  const trackSubmit = useCallback(
    (formId?: string) => {
      if (hasSentSubmit.current) return;
      hasSentSubmit.current = true;
      trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, { form_name: formName, form_id: formId });
    },
    [formName, trackEvent],
  );

  return { formRef, handleInput, trackSubmit };
}
