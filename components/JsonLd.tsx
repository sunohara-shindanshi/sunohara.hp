/**
 * 構造化データ（JSON-LD）を出力する共通コンポーネント。
 *
 * JSX の中括弧展開（<script>{JSON.stringify(data)}</script>）だと、React が本文を
 * HTML エスケープするため、記事タイトルなどに & や < が含まれると JSON-LD の値が壊れる。
 * そのため、JSON 文字列内の不等号（小なり）を Unicode エスケープに置換したうえで挿入する
 * （script の終了タグ相当の文字列による HTML 脱出も同時に防げる）。
 * この 2 段構えにより、CMS 由来の文字列が入っても安全かつ正しい JSON-LD になる。
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
