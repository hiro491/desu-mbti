export type TlsMode = "ssl" | "starttls" | "none";

export type SmtpSettings = {
  host: string;
  port: number;
  tlsMode: TlsMode;
  user: string;
  pass: string;
};

export type ParsedRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export type ParsedSheet = {
  name: string;
  headers: string[];
  rows: ParsedRow[];
  truncated: boolean;
};

export type DeliveryStatus =
  | "idle"
  | "queued"
  | "sending"
  | "sent"
  | "failed"
  | "skipped";

export type Recipient = {
  id: string;
  rowNumber: number;
  email: string;
  company: string;
  fields: Record<string, string>;
  valid: boolean;
  duplicate: boolean;
  warning: string;
  selected: boolean;
  status: DeliveryStatus;
  error?: string;
};

export type SendRecipient = {
  id: string;
  email: string;
  fields: Record<string, string>;
};

export type SendPayload = {
  smtp: SmtpSettings;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  subject: string;
  body: string;
  isHtml: boolean;
  recipients: SendRecipient[];
  mode: "bulk" | "test";
  testTo: string;
};

export type SendEvent =
  | { type: "start"; total: number }
  | { type: "sending"; id: string }
  | { type: "result"; id: string; ok: boolean; error?: string }
  | { type: "done"; sent: number; failed: number }
  | { type: "aborted"; sent: number; failed: number };
