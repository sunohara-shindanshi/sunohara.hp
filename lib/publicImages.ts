import { existsSync } from 'node:fs';
import path from 'node:path';

/** 対応する拡張子（この順番で探し、最初に見つかったものを使う） */
const SUPPORTED_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'] as const;

/**
 * public/{dir}/{name}.{拡張子} を探し、見つかれば公開 URL を返す。
 *
 * 「ファイルを置くだけで反映される」イラストのための共通処理
 * （事業内容：public/services/、当社の特徴：public/strengths/）。
 * 対応拡張子のいずれかでファイルを置けば自動的に使われ、無ければ null を返す。
 *
 * ファイルシステムを直接見るため、この関数は Server Component からのみ呼び出すこと
 * （'use client' を付けたコンポーネントからは呼び出せない）。
 */
export function findPublicImage(dir: string, name: string): string | null {
  for (const extension of SUPPORTED_EXTENSIONS) {
    const fileName = `${name}.${extension}`;
    if (existsSync(path.join(process.cwd(), 'public', dir, fileName))) {
      return `/${dir}/${fileName}`;
    }
  }
  return null;
}
