// ESLint のフラットコンフィグ。eslint-config-next 16 系はフラットコンフィグの配列を
// そのまま公開しているため、追加の互換レイヤーは不要。
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default eslintConfig;
