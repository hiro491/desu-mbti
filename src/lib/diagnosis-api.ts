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
