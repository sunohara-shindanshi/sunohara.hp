import { existsSync } from 'node:fs';
import path from 'node:path';

import type { Service } from '@/lib/services';

/**
 * 事業内容のイラスト画像を探すためのファイル置き場（public/ からの相対パス）。
 * public/services/README.md に置き方の説明を書いている。
 */
const SERVICE_IMAGE_DIR = 'services';

/** 対応する拡張子（この順番で探し、最初に見つかったものを使う） */
const SUPPORTED_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'] as const;

/**
 * public/services/{id}.{拡張子} を探し、見つかれば公開 URL を返す。
 *
 * 「ファイルを置くだけで反映される」ようにするための仕組み。呼び出し側でコードを
 * 変更する必要はなく、対応拡張子のいずれかでファイルを置けば自動的に使われる。
 * 見つからない場合は null を返し、呼び出し側は既存のアイコン表示にフォールバックする。
 *
 * ファイルシステムを直接見るため、この関数は Server Component からのみ呼び出すこと
 * （'use client' を付けたコンポーネントからは呼び出せない）。
 */
export function getServiceIllustration(id: Service['id']): string | null {
  for (const extension of SUPPORTED_EXTENSIONS) {
    const fileName = `${id}.${extension}`;
    const absolutePath = path.join(process.cwd(), 'public', SERVICE_IMAGE_DIR, fileName);
    if (existsSync(absolutePath)) {
      return `/${SERVICE_IMAGE_DIR}/${fileName}`;
    }
  }
  return null;
}
