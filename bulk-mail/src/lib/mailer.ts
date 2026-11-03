import nodemailer from "nodemailer";
import { applyTemplate, htmlToText, textToHtml } from "@/lib/template";
import type { SendRecipient, SmtpSettings, TlsMode } from "@/lib/types";

export type OutgoingAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export function createTransport(settings: SmtpSettings) {
  const tlsMode: TlsMode = settings.tlsMode;
  return nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    host: settings.host.trim(),
    port: settings.port,
    secure: tlsMode === "ssl",
    requireTLS: tlsMode === "starttls",
    ignoreTLS: tlsMode === "none",
    auth: settings.user.trim()
      ? { user: settings.user.trim(), pass: settings.pass }
      : undefined,
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 40_000,
  });
}

export function renderMessage(
  subject: string,
  body: string,
  isHtml: boolean,
  recipient: SendRecipient,
): { subject: string; text: string; html: string } {
  const renderedSubject = applyTemplate(subject, recipient.fields, false)
    .replace(/[\r\n]+/g, " ")
    .trim();
  if (isHtml) {
    const html = applyTemplate(body, recipient.fields, true);
    return { subject: renderedSubject, html, text: htmlToText(html) };
  }
  const text = applyTemplate(body, recipient.fields, false);
  return { subject: renderedSubject, text, html: textToHtml(text) };
}

export function explainMailError(error: unknown): string {
  const err = error as { code?: string; response?: string; message?: string };
  const raw = `${err.code ?? ""} ${err.response ?? ""} ${err.message ?? ""}`;
  if (/EAUTH|Invalid login|authentication failed|Username and Password not accepted/i.test(raw)) {
    return "メールサーバーへのログインに失敗しました。ユーザー名とパスワードを確認してください。Gmailの場合はアプリパスワードを使います。";
  }
  if (/ECONNREFUSED|ENOTFOUND|ECONNECTION|ESOCKET|certificate/i.test(raw)) {
    return "メールサーバーに接続できませんでした。ホスト名、ポート、暗号化方式を確認してください。";
  }
  if (/ETIMEDOUT|timeout/i.test(raw)) {
    return "メールサーバーへの接続がタイムアウトしました。";
  }
  if (/Mailbox unavailable|Recipient address rejected|User unknown/i.test(raw)) {
    return "宛先のメールアドレスが受け付けられませんでした。";
  }
  const message = err.message?.trim();
  return message || "送信に失敗しました。";
}
