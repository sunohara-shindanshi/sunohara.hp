'use server';

import { Resend } from 'resend';

import { buildContactEmail } from '@/lib/contactEmail';
import { CONTACT_SUBJECTS } from '@/lib/services';
import { siteConfig } from '@/lib/siteConfig';
import type { ContactFieldName, ContactFormState } from '@/types/contact';

/**
 * お問い合わせフォームの送信処理（Server Action 方式）。
 * 内容はメール送信サービス Resend で通知メールとして送る。
 *
 * 使用する環境変数（すべてサーバー側のみ。NEXT_PUBLIC_ を付けてはいけない）:
 * - RESEND_API_KEY     : Resend の API キー（必須・秘匿）
 * - CONTACT_FROM_EMAIL : 送信元アドレス（Resend で検証済みのドメイン。テストは onboarding@resend.dev）
 * - CONTACT_TO_EMAIL   : 通知先アドレス（任意。未設定なら siteConfig.contactEmail を使う）
 *   → 宛先を変えたいときはこの環境変数を書き換えるだけでよい。
 */

const MAX_LENGTH: Record<ContactFieldName, number> = {
  name: 100,
  company: 100,
  email: 254,
  tel: 30,
  subject: 100,
  message: 2000,
};

/** 実用上十分な範囲の簡易チェック（厳密な RFC 準拠の検証は行わない） */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_PATTERN = /^[0-9+\-() 　]+$/;

/**
 * 送信できなかったときの案内文。
 * 電話番号を掲載している間はその番号を案内し、非掲載のときは再試行を案内する
 * （通知先メールアドレスは公開していないため、ここには出さない）。
 */
const FALLBACK_CONTACT_GUIDE = siteConfig.tel
  ? `お手数ですが、お電話（${siteConfig.tel}）でご連絡ください。`
  : 'お手数ですが、時間をおいて再度お試しください。';

function getField(formData: FormData, key: ContactFieldName): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values: Record<ContactFieldName, string> = {
    name: getField(formData, 'name'),
    company: getField(formData, 'company'),
    email: getField(formData, 'email'),
    tel: getField(formData, 'tel'),
    subject: getField(formData, 'subject'),
    message: getField(formData, 'message'),
  };

  // --- サーバー側バリデーション（クライアント側の required 属性とは別に必ず実施する） ---
  const fieldErrors: Partial<Record<ContactFieldName, string>> = {};

  if (!values.name) {
    fieldErrors.name = 'お名前をご入力ください。';
  } else if (values.name.length > MAX_LENGTH.name) {
    fieldErrors.name = `お名前は${MAX_LENGTH.name}文字以内でご入力ください。`;
  }

  if (values.company.length > MAX_LENGTH.company) {
    fieldErrors.company = `会社名・屋号は${MAX_LENGTH.company}文字以内でご入力ください。`;
  }

  if (!values.email) {
    fieldErrors.email = 'メールアドレスをご入力ください。';
  } else if (values.email.length > MAX_LENGTH.email || !EMAIL_PATTERN.test(values.email)) {
    fieldErrors.email = 'メールアドレスの形式をご確認ください。';
  }

  if (values.tel && (values.tel.length > MAX_LENGTH.tel || !TEL_PATTERN.test(values.tel))) {
    fieldErrors.tel = '電話番号は数字とハイフンでご入力ください。';
  }

  if (values.subject && !CONTACT_SUBJECTS.includes(values.subject)) {
    fieldErrors.subject = 'ご相談内容を選択肢から選んでください。';
  }

  if (!values.message) {
    fieldErrors.message = 'お問い合わせ内容をご入力ください。';
  } else if (values.message.length > MAX_LENGTH.message) {
    fieldErrors.message = `お問い合わせ内容は${MAX_LENGTH.message}文字以内でご入力ください。`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      message: '入力内容をご確認ください。',
      fieldErrors,
    };
  }

  // --- メール送信（Resend） ---
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  // 通知先は環境変数を優先し、無ければ siteConfig の既定値を使う（宛先変更は環境変数だけで完結）。
  const toEmail = process.env.CONTACT_TO_EMAIL ?? siteConfig.contactEmail;

  if (!apiKey || !fromEmail) {
    // 送信の準備ができていない状態で「送信できた」と表示しない。
    console.error('[contact] RESEND_API_KEY または CONTACT_FROM_EMAIL が未設定です。');
    return {
      status: 'error',
      message: `現在フォームからの送信を受け付けられない状態です。${FALLBACK_CONTACT_GUIDE}`,
      fieldErrors: {},
    };
  }

  const { subject, text, html } = buildContactEmail(values);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      // 通知メールに返信すると、そのまま問い合わせ者へ返信できる
      replyTo: values.email,
      subject,
      text,
      html,
    });

    if (error) {
      throw new Error(`Resend responded with error: ${error.message}`);
    }
  } catch (error) {
    console.error('[contact] メール送信に失敗しました', error);
    return {
      status: 'error',
      message: `送信中に問題が発生しました。${FALLBACK_CONTACT_GUIDE}`,
      fieldErrors: {},
    };
  }

  return {
    status: 'success',
    message: 'お問い合わせを承りました。内容を確認のうえ、担当者よりご連絡いたします。',
    fieldErrors: {},
  };
}
