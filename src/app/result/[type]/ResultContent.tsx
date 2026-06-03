"use client";

import { useState } from "react";
import Link from "next/link";
import { DimensionBars } from "@/components/DimensionBars";
import { ResultIllustration } from "@/components/ResultIllustration";
import { ShareButtons } from "@/components/ShareButtons";
import { getResult } from "@/data/results";
import { loadStoredDiagnosis, useDiagnosis } from "@/context/DiagnosisContext";
import type { DiagnosisScores, DiagnosisType } from "@/types/diagnosis";
import { formatTypeDisplay } from "@/types/diagnosis";
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

export function ResultContent({ type, shareUrl }: ResultContentProps) {
  const result = getResult(type);
  const { diagnosis } = useDiagnosis();
  const [storedScores] = useState<DiagnosisScores | null>(() =>
    loadStoredDiagnosis(),
  );

  const scores = pickScores(type, diagnosis, storedScores);
  const typeDisplay = scores?.typeDisplay ?? formatTypeDisplay(type);
  const shareText = `私のデスMBTIは「${result.name}（${typeDisplay}）」でした。${result.catchphrase}`;

  return (
    <section className="rounded-2xl border border-dawn-border bg-dawn-card p-6 shadow-sm sm:p-8">
      <p className="text-center text-xs text-dawn-muted">あなたのタイプ</p>
      <ResultIllustration type={type} />
      <p className="mt-4 text-center text-2xl font-bold tracking-widest text-dawn-accent sm:text-3xl">
        {typeDisplay}
      </p>
      <h2 className="mt-2 text-center text-xl font-semibold">
        {result.name}
      </h2>
      <p className="mt-1 text-center text-xs text-dawn-muted">
        {result.animal}タイプ
      </p>
      <p className="mt-3 text-center text-sm italic text-dawn-muted">
        {result.catchphrase}
      </p>

      {scores?.percent && (
        <div className="mt-6 border-t border-dawn-border pt-6">
          <DimensionBars percent={scores.percent} />
        </div>
      )}

      <div className="mt-6 space-y-5 border-t border-dawn-border pt-6">
        <div>
          <h3 className="text-xs font-bold tracking-widest text-dawn-accent">
            概要
          </h3>
          <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold tracking-widest text-dawn-accent">
            特徴
          </h3>
          <p className="mt-2 text-sm leading-relaxed">{result.traits}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold tracking-widest text-dawn-accent">
            向いている終活
          </h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-dawn-accent-light">
            {result.suitableEndOfLife}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold tracking-widest text-dawn-accent">
            相性の良いタイプ
          </h3>
          <p className="mt-2 text-sm leading-relaxed">{result.compatibleTypes}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold tracking-widest text-dawn-accent">
            より良く生きるヒント
          </h3>
          <p className="mt-2 text-sm leading-relaxed">{result.livingHint}</p>
        </div>
      </div>

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
