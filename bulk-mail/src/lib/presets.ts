import type { TlsMode } from "@/lib/types";

export type SmtpPreset = {
  id: string;
  label: string;
  host: string;
  port: number;
  tlsMode: TlsMode;
  hint: string;
};

export const SMTP_PRESETS: SmtpPreset[] = [
  {
    id: "gmail",
    label: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    tlsMode: "ssl",
    hint: "Googleアカウントで2段階認証を有効にし、アプリパスワードを作ってパスワード欄に入れます。通常のログインパスワードでは送れません。",
  },
  {
    id: "microsoft",
    label: "Outlook / Microsoft 365",
    host: "smtp.office365.com",
    port: 587,
    tlsMode: "starttls",
    hint: "組織の管理者が SMTP AUTH を許可している必要があります。",
  },
  {
    id: "yahoo",
    label: "Yahoo!メール",
    host: "smtp.mail.yahoo.co.jp",
    port: 465,
    tlsMode: "ssl",
    hint: "Yahoo!メールのSMTP設定に合わせて、表示されたホスト名とパスワードを使います。",
  },
  {
    id: "xserver",
    label: "エックスサーバー",
    host: "",
    port: 465,
    tlsMode: "ssl",
    hint: "サーバーパネルに記載のSMTPサーバー名（sv○○.xserver.jp）をホストに入力します。",
  },
  {
    id: "sakura",
    label: "さくらのメール",
    host: "",
    port: 587,
    tlsMode: "starttls",
    hint: "初期ドメイン（○○.sakura.ne.jp）をホストに入力します。",
  },
  {
    id: "custom",
    label: "その他",
    host: "",
    port: 587,
    tlsMode: "starttls",
    hint: "契約中のメールサービスにあるSMTPホスト、ポート、暗号化方式を入力します。",
  },
];

export const TLS_OPTIONS: { value: TlsMode; label: string }[] = [
  { value: "ssl", label: "SSL/TLS（通常は465）" },
  { value: "starttls", label: "STARTTLS（通常は587）" },
  { value: "none", label: "暗号化しない" },
];
