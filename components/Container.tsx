import type { ReactNode } from 'react';

/** 全ページ共通の左右余白・最大幅。ページごとに px-* を直書きしない。 */
export default function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
