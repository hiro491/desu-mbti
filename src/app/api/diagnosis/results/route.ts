import { NextResponse } from "next/server";
import { isDiagnosisResultRecord } from "@/lib/diagnosis-record";
import {
  getDiagnosisStorageBackend,
  saveDiagnosisRecord,
} from "@/lib/server/diagnosis-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isDiagnosisResultRecord(body)) {
      return NextResponse.json(
        { error: "診断結果データの形式が正しくありません。" },
        { status: 400 },
      );
    }

    await saveDiagnosisRecord(body);
    return NextResponse.json(
      { ok: true, storage: getDiagnosisStorageBackend() },
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
