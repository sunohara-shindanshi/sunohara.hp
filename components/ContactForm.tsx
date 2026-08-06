'use client';

// フォームの送信状態を扱う（useActionState / useRef / useEffect）ため Client Component。
// 実際の送信処理は Server Action（app/contact/actions.ts）側で行う。

import { useActionState, useEffect } from 'react';

import { useFormTracking } from '@/components/analytics/useFormTracking';
import { submitContactForm } from '@/app/contact/actions';
import { CONTACT_SUBJECTS } from '@/lib/services';
import { initialContactFormState } from '@/types/contact';

/** 計測上のフォーム名（GA4 の form_name） */
const FORM_NAME = 'contact';

/** 入力欄の共通スタイル（同じ役割のクラスを個別に定義しないよう 1 箇所にまとめる） */
const fieldClassName =
  'w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink placeholder:text-brand-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-accent';

function RequiredMark() {
  return (
    <span className="ml-2 rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
      必須
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-xs text-red-700">
      {message}
    </p>
  );
}

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialContactFormState);
  // 表示（form_view）・入力開始（form_start）・送信成功（form_submit）の計測。
  // フォーム要素への ref は計測側と共用する。
  const { formRef, handleInput, trackSubmit } = useFormTracking(FORM_NAME);

  useEffect(() => {
    if (state.status !== 'success') return;

    // 送信「成功」のときだけ計測する（バリデーションエラーは送らない）
    trackSubmit();
    // 送信成功時に入力内容をクリアする（DOM 操作はマウント後の useEffect 内で行う）
    formRef.current?.reset();
  }, [state.status, trackSubmit, formRef]);

  return (
    // onInput はテキスト入力、onChange はセレクトの選択を拾う。
    // どちらで発火しても form_start は 1 回しか送られない（useFormTracking 側で制御）。
    <form
      ref={formRef}
      action={formAction}
      onInput={handleInput}
      onChange={handleInput}
      className="space-y-6"
    >
      {state.message ? (
        <p
          role={state.status === 'error' ? 'alert' : 'status'}
          className={`rounded-md border px-4 py-3 text-sm leading-relaxed ${
            state.status === 'success'
              ? 'border-brand-accentsoft bg-brand-bg text-brand-navy'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="contact-name" className="flex items-center text-sm font-medium text-brand-navy">
          お名前
          <RequiredMark />
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          aria-invalid={state.fieldErrors.name ? true : undefined}
          aria-describedby={state.fieldErrors.name ? 'contact-name-error' : undefined}
          className={`mt-2 ${fieldClassName}`}
        />
        <FieldError id="contact-name-error" message={state.fieldErrors.name} />
      </div>

      <div>
        <label htmlFor="contact-company" className="block text-sm font-medium text-brand-navy">
          会社名・屋号
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          maxLength={100}
          autoComplete="organization"
          aria-invalid={state.fieldErrors.company ? true : undefined}
          aria-describedby={state.fieldErrors.company ? 'contact-company-error' : undefined}
          className={`mt-2 ${fieldClassName}`}
        />
        <FieldError id="contact-company-error" message={state.fieldErrors.company} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-email"
            className="flex items-center text-sm font-medium text-brand-navy"
          >
            メールアドレス
            <RequiredMark />
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            aria-invalid={state.fieldErrors.email ? true : undefined}
            aria-describedby={state.fieldErrors.email ? 'contact-email-error' : undefined}
            className={`mt-2 ${fieldClassName}`}
          />
          <FieldError id="contact-email-error" message={state.fieldErrors.email} />
        </div>

        <div>
          <label htmlFor="contact-tel" className="block text-sm font-medium text-brand-navy">
            電話番号
          </label>
          <input
            id="contact-tel"
            name="tel"
            type="tel"
            maxLength={30}
            autoComplete="tel"
            aria-invalid={state.fieldErrors.tel ? true : undefined}
            aria-describedby={state.fieldErrors.tel ? 'contact-tel-error' : undefined}
            className={`mt-2 ${fieldClassName}`}
          />
          <FieldError id="contact-tel-error" message={state.fieldErrors.tel} />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-brand-navy">
          ご相談内容
        </label>
        <select
          id="contact-subject"
          name="subject"
          defaultValue=""
          aria-invalid={state.fieldErrors.subject ? true : undefined}
          aria-describedby={state.fieldErrors.subject ? 'contact-subject-error' : undefined}
          className={`mt-2 ${fieldClassName}`}
        >
          <option value="">選択してください</option>
          {CONTACT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <FieldError id="contact-subject-error" message={state.fieldErrors.subject} />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="flex items-center text-sm font-medium text-brand-navy"
        >
          お問い合わせ内容
          <RequiredMark />
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={8}
          maxLength={2000}
          aria-invalid={state.fieldErrors.message ? true : undefined}
          aria-describedby={state.fieldErrors.message ? 'contact-message-error' : undefined}
          className={`mt-2 ${fieldClassName}`}
        />
        <FieldError id="contact-message-error" message={state.fieldErrors.message} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full justify-center rounded-full bg-brand-navy px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-brand-navysoft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? '送信中…' : '入力内容を送信する'}
      </button>
    </form>
  );
}
