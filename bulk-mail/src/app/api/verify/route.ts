import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/email";
import { createTransport, explainMailError } from "@/lib/mailer";
import type { SmtpSettings, TlsMode } from "@/lib/types";

export const runtime = "nodejs";

const TLS_MODES = new Set<TlsMode>(["ssl", "starttls", "none"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SmtpSettings>;
    const tlsMode = body.tlsMode;
    const port = Number(body.port);
    if (!body.host?.trim()) {
      return NextResponse.json({ error: "SMTPホストを入力してください。" }, { status: 400 });
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return NextResponse.json({ error: "ポート番号が正しくありません。" }, { status: 400 });
    }
    if (!tlsMode || !TLS_MODES.has(tlsMode)) {
      return NextResponse.json({ error: "暗号化方式を選択してください。" }, { status: 400 });
    }
    if (body.user && body.user.includes("@") && !isValidEmail(body.user.trim())) {
      return NextResponse.json({ error: "SMTPユーザーの形式を確認してください。" }, { status: 400 });
    }

    const transport = createTransport({
      host: body.host,
      port,
      tlsMode,
      user: body.user ?? "",
      pass: body.pass ?? "",
    });
    await transport.verify();
    transport.close();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: explainMailError(error) }, { status: 400 });
  }
}
