import Link from "next/link";
import { ResultDetailSections } from "@/components/ResultDetailSections";
import { ResultHero } from "@/components/ResultHero";
import { ResultSectionHeader } from "@/components/ResultSectionHeader";
import { getResult } from "@/data/results";
import { getTypeGroup } from "@/data/type-groups";
import type { DiagnosisType } from "@/types/diagnosis";
import { formatTypeDisplay } from "@/types/diagnosis";
import { HighlightText } from "@/components/ResultText";

interface TypeDetailContentProps {
  type: DiagnosisType;
}

export function TypeDetailContent({ type }: TypeDetailContentProps) {
  const result = getResult(type);
  const group = getTypeGroup(type);
  const typeDisplay = formatTypeDisplay(type);

  return (
    <div>
      <ResultHero type={type} name={result.name} typeDisplay={typeDisplay} />

      <div className="bg-dawn-surface px-4 pb-12 pt-6 sm:px-6">
        <p
          className="text-center text-xs font-bold tracking-widest"
          style={{ color: group.accentColor }}
        >
          {group.title} — {group.subtitle}
        </p>

        <p className="mt-4 text-center text-sm font-bold leading-relaxed text-dawn-text sm:text-base">
          {result.catchphrase}
        </p>
        <p className="mx-auto mt-4 max-w-prose text-sm leading-7 text-dawn-muted sm:text-base">
          <HighlightText text={result.basicInfo} />
        </p>

        <section className="mt-10">
          <ResultSectionHeader number={1} title="花言葉とタイプ概要" />
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
          <ResultDetailSections result={result} startNumber={2} />
        </div>

        <div className="mt-12 flex flex-col items-center gap-3">
          <Link
            href="/"
            className="btn-gray inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold"
          >
            デスタイプ診断を受ける
          </Link>
          <Link
            href="/types"
            className="text-xs text-dawn-muted underline-offset-2 hover:underline"
          >
            タイプ一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
