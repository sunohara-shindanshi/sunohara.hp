/** お問い合わせフォームの入力項目名（input の name 属性と一致させる） */
export type ContactFieldName = 'name' | 'company' | 'email' | 'tel' | 'subject' | 'message';

/**
 * Server Action が返すフォームの状態。
 * 'use server' ファイルからは非同期関数以外を export できないため、型はこのファイルに置く。
 */
export type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  /** 画面上部に表示する全体メッセージ */
  message: string;
  /** 項目ごとのエラーメッセージ */
  fieldErrors: Partial<Record<ContactFieldName, string>>;
};

export const initialContactFormState: ContactFormState = {
  status: 'idle',
  message: '',
  fieldErrors: {},
};
