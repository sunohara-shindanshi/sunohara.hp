'use server';

import { CONTACT_SUBJECTS } from '@/lib/services';
import { siteConfig } from '@/lib/siteConfig';
import type { ContactFieldName, ContactFormState } from '@/types/contact';

/**
 * お問い合わせフォームの送信処理（Server Action 方式）。
 *
 * 送信先は未確定のため、実際のエンドポイントやキーはハードコードせず環境変数から読む。
 * - CONTACT_API_ENDPOINT : 送信先 URL（メール通知サービスや自前 API）
 * - CONTACT_API_KEY      : 送信先が認証を要求する場合のみ設定（任意）
 * どちらもサーバー側のみで使う値であり、NEXT_PUBLIC_ を付けてはいけない。
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

  // --- 送信 ---
  const endpoint = process.env.CONTACT_API_ENDPOINT;
  if (!endpoint) {
    // 送信先が未設定の状態で「送信できた」と表示しない。
    return {
      status: 'error',
      message: `現在フォームの送信先が未設定のため、送信を完了できませんでした。お急ぎの場合はお電話（${siteConfig.tel}）でご連絡ください。`,
      fieldErrors: {},
    };
  }

  const apiKey = process.env.CONTACT_API_KEY;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        ...values,
        // 送信元サイトの識別用（送信先サービスの仕様に合わせてキー名は要調整）
        site: siteConfig.name,
        submittedAt: new Date().toISOString(),
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Contact endpoint responded with ${response.status}`);
    }
  } catch (error) {
    console.error('[contact] 送信に失敗しました', error);
    return {
      status: 'error',
      message: `送信中に問題が発生しました。時間をおいて再度お試しいただくか、お電話（${siteConfig.tel}）でご連絡ください。`,
      fieldErrors: {},
    };
  }

  return {
    status: 'success',
    message: 'お問い合わせを承りました。内容を確認のうえ、担当者よりご連絡いたします。',
    fieldErrors: {},
  };
}
