import { findPublicImage } from '@/lib/publicImages';
import type { Service } from '@/lib/services';

/**
 * 事業内容のイラスト画像を探す（public/services/{id}.{拡張子}）。
 * public/services/README.md に置き方の説明を書いている。
 * 見つからない場合は null を返し、呼び出し側はイラストなしで表示する。
 * Server Component からのみ呼び出すこと（lib/publicImages.ts 参照）。
 */
export function getServiceIllustration(id: Service['id']): string | null {
  return findPublicImage('services', id);
}
