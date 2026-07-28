"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DimensionBars } from "@/components/DimensionBars";
import { ResultDetailSections } from "@/components/ResultDetailSections";
import { ResultIllustration } from "@/components/ResultIllustration";
import { ShareButtons } from "@/components/ShareButtons";
import { getResult } from "@/data/results";
import {
  loadStoredDiagnosis,
  loadStoredResultRecord,
  useDiagnosis,
} from "@/context/DiagnosisContext";
import { saveDiagnosisRecordToServer } from "@/lib/diagnosis-api";
import type { DiagnosisResultRecord, DiagnosisScores, DiagnosisType } from "@/types/diagnosis";
import { formatTypeDisplay } from "@/types/diagnosis";
import { HighlightText, SectionTitle } from "@/components/ResultText";
import { ResultResetButton } from "./ResultResetButton";

interface ResultContentProps {
  type: DiagnosisType;
  shareUrl: string;
}

function pickScores(
  type: DiagnosisType,
  fromContext: DiagnosisScores | null,
  fromStorage: DiagnosisScores | null,
): DiagnosisScores | null {
  if (fromContext?.type === type) return fromContext;
  if (fromStorage?.type === type) return fromStorage;
  return null;
}

function pickRecord(
  type: DiagnosisType,
  fromContext: DiagnosisResultRecord | null,
  fromStorage: DiagnosisResultRecord | null,
): DiagnosisResultRecord | null {
  if (fromContext?.result.type === type) return fromContext;
  if (fromStorage?.result.type === type) return fromStorage;
  return null;
}

function scrollToDetail() {
  document.getElementById("result-detail")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function ResultContent({ type, shareUrl }: ResultContentProps) {
  const result = getResult(type);
  const { diagnosis, resultRecord } = useDiagnosis();
  const [storedScores] = useState<DiagnosisScores | null>(() =>
    loadStoredDiagnosis(),
  );
  const [storedRecord] = useState<DiagnosisResultRecord | null>(() =>
    loadStoredResultRecord(),
  );

  const scores = pickScores(type, diagnosis, storedScores);
  const record = pickRecord(type, resultRecord, storedRecord);
  const typeDisplay = scores?.typeDisplay ?? formatTypeDisplay(type);
  const shareText = `私のデスタイプ診断の結果は「${result.name}（${typeDisplay}）」でした。${result.catchphrase}`;

  useEffect(() => {
    if (!record) return;
    void saveDiagnosisRecordToServer(record);
  }, [record]);

  return (
    <section className="rounded-2xl border border-dawn-border bg-dawn-card p-6 shadow-sm sm:p-8">
      <p className="text-center text-xs text-dawn-muted">あなたのタイプ</p>
      <ResultIllustration type={type} />
      <p className="mt-4 text-center text-2xl font-bold tracking-[0.18em] text-dawn-text sm:text-3xl">
        {typeDisplay}
      </p>
      <h2 className="mt-2 text-center text-xl font-semibold text-dawn-text">
        {result.name}
      </h2>
      <p className="mt-1 text-center text-xs text-dawn-muted">
        {result.flower}タイプ
      </p>
      <p className="mt-4 rounded-lg border border-dawn-border bg-gray-50 px-4 py-3 text-center text-sm font-bold leading-relaxed text-dawn-text">
        {result.catchphrase}
      </p>

      {scores?.percent && (
        <div className="mt-6 border-t border-dawn-border pt-6">
          <DimensionBars percent={scores.percent} />
        </div>
      )}

      <div className="mt-6 space-y-4 border-t border-dawn-border pt-6">
        <div className="rounded-xl border border-dawn-border bg-white p-4 sm:p-5">
          <SectionTitle>基本情報</SectionTitle>
          <p className="mt-4 text-sm leading-7 text-dawn-text">
            <HighlightText text={result.basicInfo} />
          </p>
        </div>

        <div className="rounded-xl border border-dawn-border bg-gray-50 px-4 py-3 text-center sm:px-5">
          <p className="text-xs font-bold tracking-widest text-dawn-text underline decoration-gray-400 decoration-2 underline-offset-4">
            花言葉
          </p>
          <p className="mt-2 text-sm font-bold text-dawn-text">
            {result.flowerLanguage}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={scrollToDetail}
            className="btn-gray rounded-xl px-6 py-3 text-sm font-bold shadow-sm"
          >
            詳しく診断結果を見る
          </button>
        </div>
      </div>

      <ResultDetailSections result={result} />

      <div className="mt-8">
        <p className="mb-3 text-center text-xs text-dawn-muted">
          結果をシェアする
        </p>
        <ShareButtons shareText={shareText} shareUrl={shareUrl} />
      </div>

      <div className="mt-8 flex justify-center">
        <ResultResetButton />
      </div>
      <div className="mt-3 flex justify-center">
        <Link
          href="/"
          className="text-xs text-dawn-muted underline-offset-2 hover:underline"
        >
          トップへ戻る
        </Link>
      </div>
    </section>
  );
}
