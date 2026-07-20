"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import {
  downloadDiagnosisCsv,
  downloadDiagnosisRecords,
} from "@/lib/diagnosis-record";
import { fetchAllDiagnosisRecords } from "@/lib/diagnosis-api";
import type { DiagnosisResultRecord } from "@/types/diagnosis";

export default function AdminResultsPage() {
  const [records, setRecords] = useState<DiagnosisResultRecord[]>([]);
  const [storage, setStorage] = useState<"firestore" | "file" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllDiagnosisRecords();
        setRecords(data.records);
        setStorage(data.storage);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました。",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <PageShell layout="scroll">
      <section className="rounded-2xl border border-dawn-border bg-dawn-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-dawn-text">診断結果データ</h2>
        <p className="mt-1 text-sm text-dawn-muted">
          保存された診断結果を一覧表示・エクスポートできます。
        </p>
        {loading && (
          <p className="text-sm text-dawn-muted">読み込み中...</p>
        )}

        {!loading && error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <>
            <p className="text-sm text-dawn-muted">
              保存件数: <span className="font-semibold text-dawn-text">{records.length}</span> 件
              {storage && (
                <span className="ml-2 text-xs">
                  （保存先: {storage === "firestore" ? "Firestore" : "ローカルファイル"}）
                </span>
              )}
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadDiagnosisRecords(records)}
                disabled={records.length === 0}
                className="inline-flex items-center justify-center rounded-xl border border-dawn-accent bg-dawn-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-dawn-accent-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                全件JSONをダウンロード
              </button>
              <button
                type="button"
                onClick={() => downloadDiagnosisCsv(records)}
                disabled={records.length === 0}
                className="inline-flex items-center justify-center rounded-xl border border-dawn-border bg-white px-5 py-2.5 text-sm font-medium text-dawn-text transition hover:border-dawn-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                全件CSVをダウンロード
              </button>
            </div>

            {records.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-dawn-border text-dawn-muted">
                      <th className="px-3 py-2 font-medium">完了日時</th>
                      <th className="px-3 py-2 font-medium">タイプ</th>
                      <th className="px-3 py-2 font-medium">名称</th>
                      <th className="px-3 py-2 font-medium">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-dawn-border/70"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {new Date(record.completedAt).toLocaleString("ja-JP")}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {record.result.typeDisplay}
                        </td>
                        <td className="px-3 py-2">{record.result.name}</td>
                        <td className="px-3 py-2 font-mono text-xs text-dawn-muted">
                          {record.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="mt-6">
          <Link
            href="/"
            className="text-xs text-dawn-muted underline-offset-2 hover:underline"
          >
            トップへ戻る
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
