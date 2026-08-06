'use client';

import { useEffect } from 'react';

import {
  SCROLL_EVENT_BY_THRESHOLD,
  SCROLL_THRESHOLDS,
  type ScrollThreshold,
  type TrackEvent,
} from '@/lib/analytics/events';

/**
 * スクロール率（25 / 50 / 75 / 100%）の計測。
 *
 * - 各しきい値は 1 ページにつき 1 回だけ送信する（重複送信の禁止）。
 * - 送信済みの記録はモジュールスコープで持つ。React の再マウント（開発時の StrictMode 等）で
 *   状態が初期化されて二重送信になるのを防ぐため。
 * - scroll イベントは passive リスナー + 間引き（THROTTLE_MS）で受け、スクロール性能に影響させない。
 *   ※ requestAnimationFrame は使わない。タブが非表示のときにコールバックが呼ばれず、
 *     計測が止まってしまうため（setTimeout は非表示でも実行される）。
 */

/** スクロール量の測定間隔（ミリ秒） */
const THROTTLE_MS = 150;

/** ページ遷移直後に測り直すまでの待ち時間（DOM の高さが確定するのを待つ） */
const REMEASURE_DELAY_MS = 100;

const firedThresholds = new Set<ScrollThreshold>();

/** 現在有効な測定関数（ページ遷移直後の測り直しに使う） */
let currentMeasure: (() => void) | null = null;

/**
 * ページが変わったときに送信済み記録を消す（PageViewTracker のページビュー送信時に呼ぶ）。
 * 遷移直後は DOM の高さが確定していないため、少し待ってから測り直す。
 */
export function resetScrollTracking(): void {
  firedThresholds.clear();
  if (currentMeasure && typeof window !== 'undefined') {
    const measure = currentMeasure;
    window.setTimeout(() => measure(), REMEASURE_DELAY_MS);
  }
}

export function useScrollTracking(trackEvent: TrackEvent): void {
  useEffect(() => {
    let timerId = 0;

    const measure = () => {
      timerId = 0;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      // 1 画面に収まるページはスクロールできないため、表示された時点で 100% とみなす
      const percent =
        scrollableHeight <= 0 ? 100 : Math.min(100, (window.scrollY / scrollableHeight) * 100);

      for (const threshold of SCROLL_THRESHOLDS) {
        // しきい値は昇順。到達していないものが出たらそれ以降も未到達
        if (percent + 0.5 < threshold) break;
        if (firedThresholds.has(threshold)) continue;

        firedThresholds.add(threshold);
        trackEvent(SCROLL_EVENT_BY_THRESHOLD[threshold], { percent_scrolled: threshold });
      }
    };

    const requestMeasure = () => {
      if (timerId === 0) timerId = window.setTimeout(measure, THROTTLE_MS);
    };

    currentMeasure = measure;
    // 初期表示の時点でページが短い場合（＝すでに 100%）も取りこぼさない
    measure();

    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure, { passive: true });

    return () => {
      if (timerId !== 0) window.clearTimeout(timerId);
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
      currentMeasure = null;
    };
  }, [trackEvent]);
}
