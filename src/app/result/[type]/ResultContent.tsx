"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DimensionBars } from "@/components/DimensionBars";
import { ResultDetailSections } from "@/components/ResultDetailSections";
import { ResultHero } from "@/components/ResultHero";
import { ResultSectionHeader } from "@/components/ResultSectionHeader";
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
import { HighlightText } from "@/components/ResultText";
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
    <div>
      <ResultHero type={type} name={result.name} typeDisplay={typeDisplay} />

      <div className="bg-dawn-surface px-4 pb-12 pt-6 sm:px-6">
        <p className="text-center text-sm font-bold leading-relaxed text-dawn-text sm:text-base">
          {result.catchphrase}
        </p>
        <p className="mx-auto mt-4 max-w-prose text-sm leading-7 text-dawn-muted sm:text-base">
          <HighlightText text={result.basicInfo} />
        </p>

        {scores?.percent && (
          <section className="mt-10">
            <ResultSectionHeader number={1} title="死生観の4軸" />
            <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
              <DimensionBars percent={scores.percent} />
            </div>
          </section>
        )}

        <section className="mt-10">
          <ResultSectionHeader number={2} title="花言葉とタイプ概要" />
          <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
            <p className="text-center text-xs font-bold tracking-widest text-odo">
              {result.flower} — 花言葉
            </p>
            <p className="mt-2 text-center text-base font-bold text-dawn-text">
              {result.flowerLanguage}
            </p>
          </div>
        </section>

        <div className="mt-10">
          <ResultDetailSections result={result} startNumber={3} />
        </div>

        <div className="mt-12 rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <p className="mb-4 text-center text-sm font-bold text-dawn-text">
            結果をシェアする
          </p>
          <ShareButtons shareText={shareText} shareUrl={shareUrl} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <ResultResetButton />
          <Link
            href="/"
            className="text-xs text-dawn-muted underline-offset-2 hover:underline"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
