import { NextResponse } from "next/server";
import { parseUpload } from "@/lib/excel";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ファイルを選択してください。" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "ファイルが空です。" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "ファイルは5MB以下にしてください。" }, { status: 400 });
    }
    const sheets = await parseUpload(Buffer.from(await file.arrayBuffer()), file.name);
    return NextResponse.json({ sheets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ファイルを読み込めませんでした。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
