import { NextResponse } from "next/server";
import { isDiagnosisResultRecord } from "@/lib/diagnosis-record";
import {
  getDiagnosisStorageBackend,
  listDiagnosisRecords,
  saveDiagnosisRecord,
} from "@/lib/server/diagnosis-store";

export async function GET() {
  try {
    const records = await listDiagnosisRecords();
    return NextResponse.json({
      records,
      count: records.length,
      storage: getDiagnosisStorageBackend(),
    });
  } catch (error) {
    console.error("Failed to list diagnosis records:", error);
    const message =
      error instanceof Error ? error.message : "診断結果データの取得に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isDiagnosisResultRecord(body)) {
      return NextResponse.json(
        { error: "診断結果データの形式が正しくありません。" },
        { status: 400 },
      );
    }

    const saved = await saveDiagnosisRecord(body);
    return NextResponse.json(
      { record: saved, storage: getDiagnosisStorageBackend() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save diagnosis record:", error);
    return NextResponse.json(
      { error: "診断結果データの保存に失敗しました。" },
      { status: 500 },
    );
  }
}
