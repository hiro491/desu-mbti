"use client";

import { useEffect, useState } from "react";
import {
  downloadDiagnosisRecord,
  isDiagnosisResultRecord,
} from "@/lib/diagnosis-record";
import { saveDiagnosisRecordToServer } from "@/lib/diagnosis-api";
import type { DiagnosisResultRecord } from "@/types/diagnosis";

interface SaveResultDataProps {
  record: DiagnosisResultRecord;
}

export function SaveResultData({ record }: SaveResultDataProps) {
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function persist() {
      setSaveState("saving");
      const result = await saveDiagnosisRecordToServer(record);
      if (cancelled) return;

      if (result.ok) {
        setSaveState("saved");
        setErrorMessage(null);
        return;
      }

      setSaveState("error");
      setErrorMessage(result.error);
    }

    void persist();

    return () => {
      cancelled = true;
    };
  }, [record.id]);

  const handleDownload = () => {
    if (!isDiagnosisResultRecord(record)) return;
    downloadDiagnosisRecord(record);
  };

  return (
    <div className="mt-6 rounded-xl border border-dawn-border bg-dawn-surface p-4">
      <h3 className="text-xs font-bold tracking-widest text-dawn-accent">
        診断データ
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-dawn-muted">
        回答・スコア・タイプ情報を含む診断結果データを保存できます。
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center rounded-xl border border-dawn-accent bg-dawn-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-dawn-accent-light"
        >
          JSONをダウンロード
        </button>
        <div className="inline-flex items-center rounded-xl border border-dawn-border bg-white px-4 py-2.5 text-sm text-dawn-muted">
          {saveState === "saving" && "サーバーへ保存中..."}
          {saveState === "saved" && "サーバーへ保存済み"}
          {saveState === "error" &&
            (errorMessage ?? "サーバーへの保存に失敗しました")}
          {saveState === "idle" && "保存待機中..."}
        </div>
      </div>
    </div>
  );
}
