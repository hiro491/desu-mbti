"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { isValidEmail } from "@/lib/email";
import { SMTP_PRESETS, TLS_OPTIONS } from "@/lib/presets";
import { buildRecipients, suggestColumns } from "@/lib/recipients";
import { applyTemplate, htmlToText, placeholdersIn, textToHtml } from "@/lib/template";
import type { ParsedSheet, Recipient, SendEvent, TlsMode } from "@/lib/types";

const STORAGE_KEY = "bulk-mail-draft-v1";
const MAX_ATTACHMENTS = 8;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
const DEFAULT_SUBJECT = "{{事業所名}}様へのご案内";
const DEFAULT_BODY = `{{事業所名}} 御中

いつもお世話になっております。

ご案内の資料を添付しております。
ご確認のほど、よろしくお願いいたします。`;

const controlClass =
  "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-seal";

type AttachmentItem = { id: string; file: File };
type Draft = {
  preset: string;
  host: string;
  port: number;
  tlsMode: TlsMode;
  user: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  subject: string;
  body: string;
  isHtml: boolean;
};

const STATUS_LABEL: Record<Recipient["status"], string> = {
  idle: "未送信",
  queued: "待機",
  sending: "送信中",
  sent: "送信済み",
  failed: "失敗",
  skipped: "中断",
};

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function isTlsMode(value: unknown): value is TlsMode {
  return value === "ssl" || value === "starttls" || value === "none";
}

function defaultDraft(): Draft {
  const gmail = SMTP_PRESETS[0];
  return {
    preset: gmail.id,
    host: gmail.host,
    port: gmail.port,
    tlsMode: gmail.tlsMode,
    user: "",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    subject: DEFAULT_SUBJECT,
    body: DEFAULT_BODY,
    isHtml: false,
  };
}

function parseDraft(raw: string): Draft {
  const base = defaultDraft();
  if (!raw) return base;
  try {
    const draft = JSON.parse(raw) as Partial<Draft>;
    return {
      ...base,
      preset: typeof draft.preset === "string" ? draft.preset : base.preset,
      host: typeof draft.host === "string" ? draft.host : base.host,
      port: typeof draft.port === "number" && draft.port > 0 ? draft.port : base.port,
      tlsMode: isTlsMode(draft.tlsMode) ? draft.tlsMode : base.tlsMode,
      user: typeof draft.user === "string" ? draft.user : "",
      fromName: typeof draft.fromName === "string" ? draft.fromName : "",
      fromEmail: typeof draft.fromEmail === "string" ? draft.fromEmail : "",
      replyTo: typeof draft.replyTo === "string" ? draft.replyTo : "",
      subject: typeof draft.subject === "string" ? draft.subject : base.subject,
      body: typeof draft.body === "string" ? draft.body : base.body,
      isHtml: typeof draft.isHtml === "boolean" ? draft.isHtml : false,
    };
  } catch {
    return base;
  }
}

function subscribeDraft(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function MailStudio() {
  const stored = useSyncExternalStore(subscribeDraft, () => localStorage.getItem(STORAGE_KEY) ?? "", () => null);
  if (stored === null) {
    return <main className="mx-auto max-w-6xl px-4 py-16 text-muted">読み込んでいます…</main>;
  }
  return <MailStudioForm initialDraft={parseDraft(stored)} />;
}

function MailStudioForm({ initialDraft }: { initialDraft: Draft }) {
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [sheetName, setSheetName] = useState("");
  const [fileLabel, setFileLabel] = useState("");
  const [emailColumn, setEmailColumn] = useState("");
  const [companyColumn, setCompanyColumn] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);
  const [isHtml, setIsHtml] = useState(initialDraft.isHtml);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [preset, setPreset] = useState(initialDraft.preset);
  const [host, setHost] = useState(initialDraft.host);
  const [port, setPort] = useState(initialDraft.port);
  const [tlsMode, setTlsMode] = useState<TlsMode>(initialDraft.tlsMode);
  const [user, setUser] = useState(initialDraft.user);
  const [pass, setPass] = useState("");
  const [fromName, setFromName] = useState(initialDraft.fromName);
  const [fromEmail, setFromEmail] = useState(initialDraft.fromEmail);
  const [replyTo, setReplyTo] = useState(initialDraft.replyTo);
  const [testTo, setTestTo] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState("");
  const [verifyMessage, setVerifyMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [testMessage, setTestMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [summary, setSummary] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const focusedField = useRef<"subject" | "body">("body");
  const abortRef = useRef<AbortController | null>(null);

  const sheet = sheets.find((item) => item.name === sheetName) ?? null;
  const activePreset = SMTP_PRESETS.find((item) => item.id === preset) ?? SMTP_PRESETS[5];

  useEffect(() => {
    const draft: Draft = {
      preset,
      host,
      port,
      tlsMode,
      user,
      fromName,
      fromEmail,
      replyTo,
      subject,
      body,
      isHtml,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [preset, host, port, tlsMode, user, fromName, fromEmail, replyTo, subject, body, isHtml]);

  useEffect(() => {
    if (!confirming) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirming(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  const chosen = recipients.filter((item) => item.selected && item.valid);
  const filtered = recipients.filter((item) => {
    const haystack = `${item.company}\n${item.email}\n${item.warning}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const variables = Array.from(new Set(["事業所名", "メールアドレス", ...(sheet?.headers ?? [])]));

  const preview = useMemo(() => {
    const target =
      recipients.find((item) => item.id === previewId) ??
      recipients.find((item) => item.selected && item.valid) ??
      recipients.find((item) => item.valid) ??
      null;
    if (!target) {
      return {
        target: null,
        subject: applyTemplate(subject, {}, false).replace(/[\r\n]+/g, " ").trim(),
        text: body,
        html: isHtml ? body : textToHtml(body),
      };
    }
    const renderedSubject = applyTemplate(subject, target.fields, false).replace(/[\r\n]+/g, " ").trim();
    if (isHtml) {
      const html = applyTemplate(body, target.fields, true);
      return { target, subject: renderedSubject, text: htmlToText(html), html };
    }
    const text = applyTemplate(body, target.fields, false);
    return { target, subject: renderedSubject, text, html: textToHtml(text) };
  }, [body, isHtml, previewId, recipients, subject]);

  const missing = preview.target
    ? placeholdersIn(`${subject}\n${body}`).filter(
        (key) => !Object.prototype.hasOwnProperty.call(preview.target?.fields, key),
      )
    : [];

  const attachmentBytes = attachments.reduce((total, item) => total + item.file.size, 0);
  const sentCount = recipients.filter((item) => item.status === "sent").length;
  const failedCount = recipients.filter((item) => item.status === "failed").length;

  function applySheet(nextSheet: ParsedSheet, previous?: Recipient[]) {
    const suggestion = suggestColumns(nextSheet);
    const nextEmail = nextSheet.headers.includes(emailColumn) ? emailColumn : suggestion.email;
    const nextCompany = nextSheet.headers.includes(companyColumn) ? companyColumn : suggestion.company;
    const built = buildRecipients(nextSheet, nextEmail, nextCompany, previous);
    setSheetName(nextSheet.name);
    setEmailColumn(nextEmail);
    setCompanyColumn(nextCompany);
    setRecipients(built);
    setPreviewId(built.find((item) => item.valid)?.id ?? "");
    setQuery("");
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setNotice("");
    setSummary("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/parse", { method: "POST", body: form });
      const data = (await response.json()) as { sheets?: ParsedSheet[]; error?: string };
      if (!response.ok || !data.sheets?.length) {
        throw new Error(data.error || "ファイルを読み込めませんでした。");
      }
      setSheets(data.sheets);
      setFileLabel(file.name);
      applySheet(data.sheets[0]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ファイルを読み込めませんでした。");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function loadSample() {
    setNotice("");
    try {
      const response = await fetch("/api/sample");
      if (!response.ok) throw new Error("サンプルを取得できませんでした。");
      const blob = await response.blob();
      await uploadFile(new File([blob], "宛先サンプル.xlsx"));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "サンプルを読み込めませんでした。");
    }
  }

  function changeSheet(name: string) {
    const next = sheets.find((item) => item.name === name);
    if (!next) return;
    applySheet(next);
  }

  function changeEmailColumn(value: string) {
    if (!sheet) return;
    setEmailColumn(value);
    setRecipients(buildRecipients(sheet, value, companyColumn, recipients));
  }

  function changeCompanyColumn(value: string) {
    if (!sheet) return;
    setCompanyColumn(value);
    setRecipients(buildRecipients(sheet, emailColumn, value, recipients));
  }

  function toggleRecipient(id: string, selected: boolean) {
    setRecipients((current) =>
      current.map((item) => (item.id === id && item.valid ? { ...item, selected } : item)),
    );
  }

  function selectFiltered(selected: boolean) {
    const ids = new Set(filtered.map((item) => item.id));
    setRecipients((current) =>
      current.map((item) => (ids.has(item.id) && item.valid ? { ...item, selected } : item)),
    );
  }

  function insertVariable(name: string) {
    const token = `{{${name}}}`;
    const field = focusedField.current;
    const target = field === "subject" ? subjectRef.current : bodyRef.current;
    const current = field === "subject" ? subject : body;
    const write = field === "subject" ? setSubject : setBody;
    const active = target !== null && document.activeElement === target;
    const start = active ? (target.selectionStart ?? current.length) : current.length;
    const end = active ? (target.selectionEnd ?? current.length) : current.length;
    write(current.slice(0, start) + token + current.slice(end));
    requestAnimationFrame(() => {
      if (!target) return;
      target.focus();
      const cursor = start + token.length;
      target.setSelectionRange(cursor, cursor);
    });
  }

  function addAttachments(list: FileList | null) {
    if (!list?.length) return;
    const next = [...attachments];
    let total = attachmentBytes;
    let message = "";
    for (const file of list) {
      if (file.size <= 0) continue;
      if (next.length >= MAX_ATTACHMENTS) {
        message = `添付ファイルは${MAX_ATTACHMENTS}個までです。`;
        break;
      }
      if (total + file.size > MAX_ATTACHMENT_BYTES) {
        message = "添付ファイルの合計は15MB以下にしてください。";
        break;
      }
      total += file.size;
      next.push({ id: crypto.randomUUID(), file });
    }
    setAttachments(next);
    if (message) setNotice(message);
  }

  function applyPreset(id: string) {
    const next = SMTP_PRESETS.find((item) => item.id === id);
    if (!next) return;
    setPreset(next.id);
    setHost(next.host);
    setPort(next.port);
    setTlsMode(next.tlsMode);
    setVerifyMessage(null);
  }

  function changeTls(mode: TlsMode) {
    setTlsMode(mode);
    setVerifyMessage(null);
    setPort((current) => {
      if (mode === "ssl" && (current === 587 || current === 25)) return 465;
      if (mode === "starttls" && current === 465) return 587;
      if (mode === "none" && (current === 465 || current === 587)) return 25;
      return current;
    });
  }

  async function verifySmtp() {
    setVerifying(true);
    setVerifyMessage(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, port, tlsMode, user, pass }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "接続できませんでした。");
      setVerifyMessage({ ok: true, text: "メールサーバーへ接続できました。" });
    } catch (error) {
      setVerifyMessage({
        ok: false,
        text: error instanceof Error ? error.message : "接続できませんでした。",
      });
    } finally {
      setVerifying(false);
    }
  }

  function sendBlocker(): string {
    if (!host.trim()) return "SMTPホストを入力してください。";
    if (!Number.isInteger(port) || port < 1 || port > 65535) return "ポート番号を確認してください。";
    if (!isValidEmail(fromEmail.trim())) return "送信元メールアドレスを入力してください。";
    if (!subject.trim() || !body.trim()) return "件名と本文を入力してください。";
    if (chosen.length === 0) return "送信する宛先を選んでください。";
    return "";
  }

  function testBlocker(): string {
    if (!host.trim()) return "SMTPホストを入力してください。";
    if (!isValidEmail(fromEmail.trim())) return "送信元メールアドレスを入力してください。";
    if (!isValidEmail((testTo.trim() || fromEmail).trim())) return "テスト送信先を確認してください。";
    if (!subject.trim() || !body.trim()) return "件名と本文を入力してください。";
    return "";
  }

  async function startSend(mode: "bulk" | "test") {
    const blocker = mode === "bulk" ? sendBlocker() : testBlocker();
    if (blocker) {
      setNotice(blocker);
      setConfirming(false);
      return;
    }
    const sample = chosen[0] ?? recipients.find((item) => item.valid);
    const payloadRecipients =
      mode === "test"
        ? sample
          ? [{ id: sample.id, email: sample.email, fields: sample.fields }]
          : []
        : chosen.map(({ id, email, fields }) => ({ id, email, fields }));

    if (mode === "bulk") {
      const ids = new Set(chosen.map((item) => item.id));
      setRecipients((current) =>
        current.map((item) =>
          ids.has(item.id) ? { ...item, status: "queued", error: undefined } : item,
        ),
      );
    }

    const form = new FormData();
    form.set(
      "payload",
      JSON.stringify({
        smtp: { host, port, tlsMode, user, pass },
        fromName,
        fromEmail,
        replyTo,
        subject,
        body,
        isHtml,
        recipients: payloadRecipients,
        mode,
        testTo: testTo.trim() || fromEmail.trim(),
      }),
    );
    for (const item of attachments) form.append("attachment", item.file, item.file.name);

    const controller = new AbortController();
    abortRef.current = controller;
    setSending(true);
    setConfirming(false);
    setNotice("");
    setSummary("");
    setTestMessage(null);
    setProgress(null);

    try {
      const response = await fetch("/api/send", { method: "POST", body: form, signal: controller.signal });
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || contentType.includes("application/json")) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "送信を開始できませんでした。");
      }
      await readEvents(response, (event) => applySendEvent(event, mode));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setRecipients((current) =>
          current.map((item) =>
            item.status === "queued" || item.status === "sending"
              ? { ...item, status: "skipped" }
              : item,
          ),
        );
        setSummary("送信を中断しました。すでにサーバーへ渡ったメールは届きます。");
      } else {
        setRecipients((current) =>
          current.map((item) => (item.status === "queued" ? { ...item, status: "idle" } : item)),
        );
        setNotice(error instanceof Error ? error.message : "送信に失敗しました。");
      }
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }

  function applySendEvent(event: SendEvent, mode: "bulk" | "test") {
    if (event.type === "start") setProgress({ done: 0, total: event.total });
    if (event.type === "sending" && mode === "bulk") {
      setRecipients((current) =>
        current.map((item) => (item.id === event.id ? { ...item, status: "sending" } : item)),
      );
    }
    if (event.type === "result") {
      setProgress((current) =>
        current ? { ...current, done: Math.min(current.total, current.done + 1) } : current,
      );
      if (mode === "test") {
        setTestMessage({
          ok: event.ok,
          text: event.ok
            ? "テストメールを送信しました。届いた件名には【テスト】が付きます。"
            : event.error || "テスト送信に失敗しました。",
        });
        return;
      }
      setRecipients((current) =>
        current.map((item) =>
          item.id === event.id
            ? { ...item, status: event.ok ? "sent" : "failed", error: event.error }
            : item,
        ),
      );
    }
    if (event.type === "done") {
      setSummary(
        event.failed
          ? `${event.sent}件を送信し、${event.failed}件は失敗しました。`
          : `${event.sent}件を送信しました。`,
      );
    }
    if (event.type === "aborted") {
      setSummary("送信を中断しました。すでにサーバーへ渡ったメールは届きます。");
    }
  }

  function downloadResults() {
    const header = ["行", "事業所名", "メールアドレス", "結果", "詳細"];
    const lines = recipients.map((item) =>
      [String(item.rowNumber), item.company, item.email, STATUS_LABEL[item.status], item.error ?? item.warning]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob([`\uFEFF${[header.join(","), ...lines].join("\r\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "送信結果.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const blocker = sendBlocker();
  const testDisabledReason = testBlocker();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:pb-12">
      <header className="mb-8 flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-seal text-white shadow-sm">
          <span className="font-serif text-2xl leading-none">送</span>
        </div>
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">一斉メール</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            事業所名とメールアドレスの入ったExcelを読み込み、文面と添付ファイルを付けてまとめて送ります。
            文面の {"{{事業所名}}"} は行ごとの値に置き換わります。SMTPパスワードは保存しません。
          </p>
        </div>
      </header>

      {notice ? (
        <p className="mb-5 rounded-2xl border border-seal/20 bg-rose-soft px-4 py-3 text-sm text-seal-dark" role="alert">
          {notice}
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-sheet p-5 shadow-[0_18px_40px_rgba(72,42,22,0.05)] sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-3 text-lg font-semibold">
                <Step>1</Step>宛先
              </h2>
              <div className="flex gap-2">
                <a className="rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-ink/20" href="/api/sample">
                  ひな形をダウンロード
                </a>
                <button
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-ink/20 disabled:opacity-50"
                  type="button"
                  onClick={() => void loadSample()}
                  disabled={uploading || sending}
                >
                  サンプルを読み込む
                </button>
              </div>
            </div>
            <label
              className={`block cursor-pointer rounded-2xl border border-dashed px-4 py-8 text-center transition ${
                dragging ? "border-seal bg-rose-soft" : "border-line bg-white"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) void uploadFile(file);
              }}
            >
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadFile(file);
                }}
              />
              <span className="block text-sm font-medium">
                {uploading ? "読み込んでいます…" : "Excel（.xlsx）または CSV をドロップ"}
              </span>
              <span className="mt-1 block text-xs text-muted">1行目は見出しです。5MBまで。</span>
              {fileLabel ? <span className="mt-3 block text-sm text-pine">{fileLabel}</span> : null}
            </label>

            {sheet ? (
              <div className="mt-5 space-y-4">
                {sheets.length > 1 ? (
                  <label className="block text-sm font-medium">
                    シート
                    <select className={controlClass} value={sheet.name} onChange={(event) => changeSheet(event.target.value)}>
                      {sheets.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    メールアドレスの列
                    <select className={controlClass} value={emailColumn} onChange={(event) => changeEmailColumn(event.target.value)} disabled={sending}>
                      <option value="">選択してください</option>
                      {sheet.headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    事業所名の列
                    <select className={controlClass} value={companyColumn} onChange={(event) => changeCompanyColumn(event.target.value)} disabled={sending}>
                      <option value="">使わない</option>
                      {sheet.headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {sheet.truncated ? (
                  <p className="text-sm text-gold">先頭2000件だけ読み込みました。残りはファイルを分けて送ってください。</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted">
                    {recipients.length}行 / 送信対象 {chosen.length}件
                    {recipients.some((item) => !item.valid) ? ` / 確認が必要 ${recipients.filter((item) => !item.valid).length}行` : ""}
                  </span>
                  <button className="rounded-full px-2 py-1 text-pine underline-offset-2 hover:underline" type="button" onClick={() => selectFiltered(true)}>
                    表示中を選択
                  </button>
                  <button className="rounded-full px-2 py-1 text-muted underline-offset-2 hover:underline" type="button" onClick={() => selectFiltered(false)}>
                    表示中を解除
                  </button>
                  <input
                    className="ml-auto w-full rounded-full border border-line bg-white px-3 py-1.5 sm:w-56"
                    value={query}
                    placeholder="事業所名・メールで絞り込み"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="max-h-[420px] overflow-auto rounded-2xl border border-line">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-[#faf6ef] text-xs text-muted">
                      <tr>
                        <th className="px-3 py-2 font-medium">送る</th>
                        <th className="px-3 py-2 font-medium">行</th>
                        <th className="px-3 py-2 font-medium">事業所名</th>
                        <th className="px-3 py-2 font-medium">メールアドレス</th>
                        <th className="px-3 py-2 font-medium">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td className="px-3 py-6 text-muted" colSpan={5}>
                            該当する行がありません。
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => (
                          <tr
                            key={item.id}
                            className={`cursor-pointer border-t border-line ${item.id === preview.target?.id ? "bg-gold-soft" : "bg-white"}`}
                            onClick={() => setPreviewId(item.id)}
                          >
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                className="accent-seal"
                                checked={item.selected}
                                disabled={!item.valid || sending}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event) => toggleRecipient(item.id, event.target.checked)}
                                aria-label={`${item.company || item.email || `${item.rowNumber}行目`}を送信対象にする`}
                              />
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted">{item.rowNumber}</td>
                            <td className="px-3 py-2">{item.company || <span className="text-muted">（空欄）</span>}</td>
                            <td className="px-3 py-2">
                              <div>{item.email || "—"}</div>
                              {item.warning ? <div className="text-xs text-gold">{item.warning}</div> : null}
                              {item.error ? <div className="text-xs text-seal">{item.error}</div> : null}
                            </td>
                            <td className="px-3 py-2">
                              <StatusBadge status={item.status} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-line bg-sheet p-5 shadow-[0_18px_40px_rgba(72,42,22,0.05)] sm:p-6">
            <h2 className="mb-2 flex items-center gap-3 text-lg font-semibold">
              <Step>2</Step>文面
            </h2>
            <p className="mb-4 text-sm leading-6 text-muted">
              二重の波括弧で列名を囲むと、その行の値に置き換わります。文面はこのブラウザに自動保存されます。
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {variables.map((name) => (
                <button
                  key={name}
                  className="rounded-full border border-line bg-white px-3 py-1 text-xs hover:border-seal hover:text-seal"
                  type="button"
                  onClick={() => insertVariable(name)}
                >
                  {`{{${name}}}`}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium">
              件名
              <input
                ref={subjectRef}
                className={controlClass}
                value={subject}
                onFocus={() => {
                  focusedField.current = "subject";
                }}
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              本文
              <textarea
                ref={bodyRef}
                className={`${controlClass} min-h-52 resize-y leading-7`}
                value={body}
                onFocus={() => {
                  focusedField.current = "body";
                }}
                onChange={(event) => setBody(event.target.value)}
              />
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-seal" checked={isHtml} onChange={(event) => setIsHtml(event.target.checked)} />
              本文をHTMLとして送る
            </label>
            {missing.length > 0 ? (
              <p className="mt-3 text-sm text-gold">
                この宛先に無い差し込み: {missing.map((item) => `{{${item}}}`).join("、")}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-line bg-sheet p-5 shadow-[0_18px_40px_rgba(72,42,22,0.05)] sm:p-6">
            <h2 className="mb-2 flex items-center gap-3 text-lg font-semibold">
              <Step>3</Step>添付ファイル
            </h2>
            <p className="mb-4 text-sm text-muted">選んだファイルが、すべての宛先に同じように添付されます。合計15MB、8ファイルまで。</p>
            <label className="inline-flex cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-ink/20">
              ファイルを追加
              <input
                className="sr-only"
                type="file"
                multiple
                onChange={(event) => {
                  addAttachments(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            {attachments.length > 0 ? (
              <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
                {attachments.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">
                      {item.file.name}
                      <span className="ml-2 text-muted">{formatBytes(item.file.size)}</span>
                    </span>
                    <button
                      className="shrink-0 text-muted hover:text-seal"
                      type="button"
                      onClick={() => setAttachments((current) => current.filter((file) => file.id !== item.id))}
                    >
                      外す
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">添付なしでも送れます。</p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-sheet p-5 shadow-[0_18px_40px_rgba(72,42,22,0.05)] sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">プレビュー</h2>
              {recipients.length > 0 ? (
                <select
                  className="max-w-full rounded-full border border-line bg-white px-3 py-1.5 text-sm"
                  value={preview.target?.id ?? ""}
                  onChange={(event) => setPreviewId(event.target.value)}
                >
                  {recipients.map((item) => (
                    <option key={item.id} value={item.id}>
                      {(item.company || "事業所名なし") + " / " + (item.email || "メールなし")}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <article className="letter rounded-2xl border border-line px-5 py-4">
              <p className="text-xs text-muted">件名</p>
              <h3 className="mt-1 text-base font-semibold">{preview.subject || "（件名なし）"}</h3>
              <div className="mt-4 border-t border-line/80 pt-4">
                {isHtml ? (
                  <iframe className="h-64 w-full rounded-xl bg-white" title="本文プレビュー" sandbox="" srcDoc={preview.html} />
                ) : (
                  <p className="min-h-40 whitespace-pre-wrap text-sm leading-7">{preview.text}</p>
                )}
              </div>
              <p className="mt-4 text-xs text-muted">
                添付: {attachments.length ? attachments.map((item) => item.file.name).join("、") : "なし"}
              </p>
            </article>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-line bg-sheet p-5 shadow-[0_18px_40px_rgba(72,42,22,0.05)]">
            <h2 className="text-lg font-semibold">メールサーバー</h2>
            <p className="mt-1 text-xs leading-5 text-muted">お使いのメールアカウントから送信します。パスワードは再読み込みで消えます。</p>
            <label className="mt-4 block text-sm font-medium">
              サービス
              <select className={controlClass} value={preset} onChange={(event) => applyPreset(event.target.value)}>
                {SMTP_PRESETS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs leading-5 text-muted">{activePreset.hint}</p>
            <label className="mt-3 block text-sm font-medium">
              SMTPホスト
              <input
                className={controlClass}
                value={host}
                autoComplete="off"
                onChange={(event) => {
                  setHost(event.target.value);
                  setVerifyMessage(null);
                }}
              />
            </label>
            <div className="mt-3 grid grid-cols-[1fr_96px] gap-3">
              <label className="block text-sm font-medium">
                暗号化
                <select className={controlClass} value={tlsMode} onChange={(event) => changeTls(event.target.value as TlsMode)}>
                  {TLS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                ポート
                <input
                  className={controlClass}
                  inputMode="numeric"
                  value={port}
                  onChange={(event) => {
                    setPort(Number(event.target.value));
                    setVerifyMessage(null);
                  }}
                />
              </label>
            </div>
            <label className="mt-3 block text-sm font-medium">
              ユーザー名
              <input
                className={controlClass}
                value={user}
                autoComplete="username"
                onChange={(event) => {
                  setUser(event.target.value);
                  setVerifyMessage(null);
                }}
              />
            </label>
            <label className="mt-3 block text-sm font-medium">
              パスワード
              <input
                className={controlClass}
                type="password"
                value={pass}
                autoComplete="current-password"
                onChange={(event) => {
                  setPass(event.target.value);
                  setVerifyMessage(null);
                }}
              />
            </label>
            <button
              className="mt-4 w-full rounded-full border border-line bg-white py-2 text-sm font-medium hover:border-ink/20 disabled:opacity-50"
              type="button"
              onClick={() => void verifySmtp()}
              disabled={verifying || sending || !host.trim()}
            >
              {verifying ? "接続を確認しています…" : "接続をテスト"}
            </button>
            {verifyMessage ? (
              <p className={`mt-2 text-sm ${verifyMessage.ok ? "text-pine" : "text-seal"}`}>{verifyMessage.text}</p>
            ) : null}
            <div className="mt-5 border-t border-line pt-4">
              <label className="block text-sm font-medium">
                送信者名
                <input className={controlClass} value={fromName} onChange={(event) => setFromName(event.target.value)} />
              </label>
              <label className="mt-3 block text-sm font-medium">
                送信元メール
                <input
                  className={controlClass}
                  type="email"
                  value={fromEmail}
                  autoComplete="email"
                  onChange={(event) => setFromEmail(event.target.value)}
                />
              </label>
              <label className="mt-3 block text-sm font-medium">
                返信先
                <span className="ml-2 font-normal text-muted">空欄なら送信元</span>
                <input
                  className={controlClass}
                  type="email"
                  value={replyTo}
                  onChange={(event) => setReplyTo(event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-sheet p-5 shadow-[0_18px_40px_rgba(72,42,22,0.05)]">
            <h2 className="text-lg font-semibold">送信</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {chosen.length}件へ、同じ添付
              {attachments.length ? `（${attachments.length}ファイル）` : "なし"}
              で送ります。差し込みだけ宛先ごとに変わります。
            </p>
            {progress ? (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full bg-seal transition-all"
                    style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted" aria-live="polite">
                  {progress.done} / {progress.total}
                </p>
              </div>
            ) : null}
            {summary ? <p className="mt-3 text-sm">{summary}</p> : null}
            {sentCount + failedCount > 0 ? (
              <button className="mt-2 text-sm text-pine underline-offset-2 hover:underline" type="button" onClick={downloadResults}>
                送信結果をCSVで保存（成功 {sentCount} / 失敗 {failedCount}）
              </button>
            ) : null}
            <button
              className="mt-4 w-full rounded-full bg-seal py-3 text-sm font-semibold text-white hover:bg-seal-dark disabled:bg-line disabled:text-muted"
              type="button"
              disabled={sending || Boolean(blocker)}
              onClick={() => setConfirming(true)}
            >
              {sending ? "送信しています…" : `${chosen.length}件に送信`}
            </button>
            {blocker && !sending ? <p className="mt-2 text-xs text-muted">{blocker}</p> : null}
            <label className="mt-5 block text-sm font-medium">
              テスト送信先
              <span className="ml-2 font-normal text-muted">空欄なら送信元</span>
              <input
                className={controlClass}
                type="email"
                value={testTo}
                placeholder={fromEmail || "you@example.com"}
                onChange={(event) => setTestTo(event.target.value)}
              />
            </label>
            <button
              className="mt-3 w-full rounded-full border border-line bg-white py-2 text-sm font-medium hover:border-ink/20 disabled:opacity-50"
              type="button"
              disabled={sending || Boolean(testDisabledReason)}
              onClick={() => void startSend("test")}
            >
              テスト送信
            </button>
            {testMessage ? (
              <p className={`mt-2 text-sm ${testMessage.ok ? "text-pine" : "text-seal"}`}>{testMessage.text}</p>
            ) : null}
            <p className="mt-4 text-xs leading-5 text-muted">
              Gmailなどの無料メールには1日の送信上限があります。件数が多いときは、契約中のメールサーバーを使ってください。
            </p>
            {sending ? (
              <button className="mt-3 w-full text-sm text-seal" type="button" onClick={() => abortRef.current?.abort()}>
                送信を中断
              </button>
            ) : null}
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-sheet/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          className="w-full rounded-full bg-seal py-3 text-sm font-semibold text-white disabled:bg-line disabled:text-muted"
          type="button"
          disabled={sending || Boolean(blocker)}
          onClick={() => setConfirming(true)}
        >
          {sending ? "送信しています…" : `${chosen.length}件に送信`}
        </button>
      </div>

      {confirming ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/40 px-4" role="presentation">
          <div
            className="w-full max-w-md rounded-3xl bg-sheet p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title" className="font-serif text-2xl">
              {chosen.length}件に送信します
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {chosen
                .slice(0, 3)
                .map((item) => item.company || item.email)
                .join("、")}
              {chosen.length > 3 ? ` ほか${chosen.length - 3}件` : ""}
              へ、同じ件名の型と添付を送ります。事業所名などの差し込みだけ、行の内容に置き換わります。
            </p>
            <p className="mt-3 text-sm">
              件名: {preview.subject || "（件名なし）"}
              <br />
              添付: {attachments.length ? attachments.map((item) => item.file.name).join("、") : "なし"}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="rounded-full px-4 py-2 text-sm" type="button" onClick={() => setConfirming(false)}>
                戻る
              </button>
              <button
                className="rounded-full bg-seal px-5 py-2 text-sm font-semibold text-white"
                type="button"
                onClick={() => void startSend("bulk")}
              >
                この内容で送信する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Step({ children }: { children: string }) {
  return <span className="grid size-7 place-items-center rounded-full bg-seal text-sm text-white">{children}</span>;
}

function StatusBadge({ status }: { status: Recipient["status"] }) {
  const tone =
    status === "sent"
      ? "bg-pine-soft text-pine"
      : status === "failed"
        ? "bg-rose-soft text-seal"
        : status === "sending" || status === "queued"
          ? "bg-gold-soft text-gold"
          : "bg-paper text-muted";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${tone}`}>{STATUS_LABEL[status]}</span>;
}

async function readEvents(response: Response, onEvent: (event: SendEvent) => void) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("送信状況を受け取れませんでした。");
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      if (!part.trim()) continue;
      onEvent(JSON.parse(part) as SendEvent);
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as SendEvent);
}
