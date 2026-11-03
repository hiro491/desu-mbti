import { isValidEmail } from "@/lib/email";
import {
  createTransport,
  explainMailError,
  renderMessage,
  type OutgoingAttachment,
} from "@/lib/mailer";
import type { SendEvent, SendPayload, SendRecipient, SmtpSettings, TlsMode } from "@/lib/types";

export const runtime = "nodejs";

const MAX_RECIPIENTS = 2000;
const MAX_ATTACHMENTS = 8;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
const SEND_GAP_MS = 400;
const TLS_MODES = new Set<TlsMode>(["ssl", "starttls", "none"]);

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function line(event: SendEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "attachment";
  const cleaned = base.replace(/[\r\n\u0000"]/g, "_").trim().slice(0, 180);
  return cleaned || "attachment";
}

function cleanFields(fields: unknown): Record<string, string> | null {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return null;
  const entries = Object.entries(fields as Record<string, unknown>).slice(0, 40);
  const cleaned: Record<string, string> = {};
  for (const [key, value] of entries) {
    const name = key.trim().slice(0, 100);
    if (!name || typeof value !== "string") return null;
    cleaned[name] = value.slice(0, 5000);
  }
  return cleaned;
}

function readPayload(raw: unknown): { payload?: SendPayload; error?: string } {
  if (!raw || typeof raw !== "object") return { error: "送信内容を読み取れませんでした。" };
  const body = raw as Partial<SendPayload>;
  const smtp = body.smtp;
  if (!smtp || typeof smtp !== "object") return { error: "送信設定が不足しています。" };
  const port = Number(smtp.port);
  const tlsMode = smtp.tlsMode;
  if (!smtp.host?.trim()) return { error: "SMTPホストを入力してください。" };
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { error: "ポート番号が正しくありません。" };
  }
  if (!tlsMode || !TLS_MODES.has(tlsMode)) return { error: "暗号化方式を選択してください。" };
  if (!body.fromEmail || !isValidEmail(body.fromEmail.trim())) {
    return { error: "送信元メールアドレスの形式が正しくありません。" };
  }
  if (body.replyTo?.trim() && !isValidEmail(body.replyTo.trim())) {
    return { error: "返信先メールアドレスの形式が正しくありません。" };
  }
  if (!body.subject?.trim()) return { error: "件名を入力してください。" };
  if (!body.body?.trim()) return { error: "本文を入力してください。" };
  if (body.subject.length > 300) return { error: "件名が長すぎます。" };
  if (body.body.length > 100_000) return { error: "本文が長すぎます。" };
  if (body.mode !== "bulk" && body.mode !== "test") return { error: "送信方法が正しくありません。" };
  if (!Array.isArray(body.recipients)) return { error: "宛先がありません。" };

  const recipients: SendRecipient[] = [];
  for (const item of body.recipients) {
    if (!item || typeof item !== "object") return { error: "宛先の形式が正しくありません。" };
    const recipient = item as Partial<SendRecipient>;
    if (!recipient.id || typeof recipient.id !== "string") return { error: "宛先の形式が正しくありません。" };
    if (!recipient.email || !isValidEmail(recipient.email.trim())) {
      return { error: `送信できないメールアドレスが含まれています。（${recipient.email ?? "空欄"}）` };
    }
    const fields = cleanFields(recipient.fields);
    if (!fields) return { error: "差し込み項目の形式が正しくありません。" };
    recipients.push({
      id: recipient.id.slice(0, 200),
      email: recipient.email.trim(),
      fields,
    });
  }

  if (body.mode === "bulk" && recipients.length === 0) {
    return { error: "送信する宛先を1件以上選んでください。" };
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return { error: `一度に送れるのは${MAX_RECIPIENTS}件までです。` };
  }
  if (body.mode === "test") {
    const testTo = body.testTo?.trim() || body.fromEmail.trim();
    if (!isValidEmail(testTo)) return { error: "テスト送信先の形式が正しくありません。" };
    body.testTo = testTo;
  }

  const settings: SmtpSettings = {
    host: smtp.host.trim(),
    port,
    tlsMode,
    user: (smtp.user ?? "").trim(),
    pass: smtp.pass ?? "",
  };

  return {
    payload: {
      smtp: settings,
      fromName: (body.fromName ?? "").replace(/[\r\n]/g, " ").trim().slice(0, 100),
      fromEmail: body.fromEmail.trim(),
      replyTo: (body.replyTo ?? "").trim(),
      subject: body.subject,
      body: body.body,
      isHtml: Boolean(body.isHtml),
      recipients,
      mode: body.mode,
      testTo: (body.testTo ?? "").trim(),
    },
  };
}

async function readAttachments(form: FormData): Promise<{ files?: OutgoingAttachment[]; error?: string }> {
  const files = form.getAll("attachment").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > MAX_ATTACHMENTS) {
    return { error: `添付ファイルは${MAX_ATTACHMENTS}個までです。` };
  }
  let total = 0;
  const attachments: OutgoingAttachment[] = [];
  for (const file of files) {
    total += file.size;
    if (total > MAX_ATTACHMENT_BYTES) {
      return { error: "添付ファイルの合計は15MB以下にしてください。" };
    }
    attachments.push({
      filename: sanitizeFilename(file.name),
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || undefined,
    });
  }
  return { files: attachments };
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("送信データを読み取れませんでした。添付ファイルのサイズを確認してください。");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return jsonError("送信内容の形式が正しくありません。");
  }

  const { payload, error } = readPayload(parsed);
  if (!payload) return jsonError(error ?? "送信内容を確認してください。");

  const attachmentsResult = await readAttachments(form);
  if (!attachmentsResult.files) return jsonError(attachmentsResult.error ?? "添付ファイルを読み取れませんでした。");
  const attachments = attachmentsResult.files;

  const transport = createTransport(payload.smtp);
  try {
    await transport.verify();
  } catch (verifyError) {
    transport.close();
    return jsonError(explainMailError(verifyError));
  }

  const jobs: SendRecipient[] =
    payload.mode === "test"
      ? [
          {
            id: "test",
            email: payload.testTo,
            fields: payload.recipients[0]?.fields ?? {
              メールアドレス: payload.testTo,
              メール: payload.testTo,
              事業所名: "",
            },
          },
        ]
      : payload.recipients;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      let failed = 0;
      const emit = (event: SendEvent) => {
        if (request.signal.aborted && event.type !== "aborted") return;
        try {
          controller.enqueue(line(event));
        } catch {
          // クライアントが切断済み
        }
      };

      try {
        emit({ type: "start", total: jobs.length });
        for (let index = 0; index < jobs.length; index += 1) {
          if (request.signal.aborted) break;
          const job = jobs[index];
          emit({ type: "sending", id: job.id });
          try {
            const rendered = renderMessage(payload.subject, payload.body, payload.isHtml, job);
            if (!rendered.subject) throw new Error("差し込み後の件名が空になりました。");
            const subject = payload.mode === "test" ? `【テスト】${rendered.subject}` : rendered.subject;
            await transport.sendMail({
              from: payload.fromName
                ? { name: payload.fromName, address: payload.fromEmail }
                : payload.fromEmail,
              to: job.email,
              replyTo: payload.replyTo || undefined,
              subject,
              text: rendered.text,
              html: rendered.html,
              attachments,
            });
            sent += 1;
            emit({ type: "result", id: job.id, ok: true });
          } catch (sendError) {
            failed += 1;
            emit({
              type: "result",
              id: job.id,
              ok: false,
              error: explainMailError(sendError),
            });
          }
          if (index < jobs.length - 1) await sleep(SEND_GAP_MS, request.signal);
        }
        emit(
          request.signal.aborted
            ? { type: "aborted", sent, failed }
            : { type: "done", sent, failed },
        );
      } finally {
        transport.close();
        try {
          controller.close();
        } catch {
          // すでに閉じている
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
