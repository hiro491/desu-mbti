import type { DiagnosisResultRecord } from "@/types/diagnosis";

export async function saveDiagnosisRecordToServer(
  record: DiagnosisResultRecord,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/diagnosis/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      return {
        ok: false,
        error: data?.error ?? "サーバーへの保存に失敗しました。",
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "サーバーへの接続に失敗しました。" };
  }
}

export async function fetchAllDiagnosisRecords(): Promise<{
  records: DiagnosisResultRecord[];
  storage: "firestore" | "file";
}> {
  const response = await fetch("/api/diagnosis/results", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("診断結果データの取得に失敗しました。");
  }

  const data = (await response.json()) as {
    records: DiagnosisResultRecord[];
    storage?: "firestore" | "file";
  };
  return {
    records: data.records ?? [],
    storage: data.storage ?? "file",
  };
}
