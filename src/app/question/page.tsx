"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnswerButtons } from "@/components/AnswerButtons";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import { PageShell } from "@/components/PageShell";
import { ProgressBar } from "@/components/ProgressBar";
import { questions } from "@/data/questions";
import { useDiagnosis } from "@/context/DiagnosisContext";
import type { AnswerValue } from "@/types/diagnosis";

const PART_LABELS: Record<number, string> = {
  0: "第1部 · 感情と日常のスタンス",
  14: "第2部 · 死後観と関係性",
  29: "第3部 · 行動と意思決定",
  44: "第4部 · 最終確認",
};

function getPartLabel(index: number): string | null {
  return PART_LABELS[index] ?? null;
}

export default function QuestionPage() {
  const router = useRouter();
  const {
    currentIndex,
    totalQuestions,
    answers,
    setAnswer,
    goBack,
    diagnosis,
    isComplete,
    disclaimerAccepted,
    acceptDisclaimer,
  } = useDiagnosis();
  const [transitioning, setTransitioning] = useState(false);

  const question = questions[currentIndex];
  const partLabel = getPartLabel(currentIndex);
  const currentAnswer = answers[currentIndex];

  useEffect(() => {
    if (isComplete && diagnosis?.type) {
      router.replace(`/result/${diagnosis.type}`);
    }
  }, [isComplete, diagnosis?.type, router]);

  const handleSelect = useCallback(
    (value: AnswerValue) => {
      if (transitioning) return;
      setTransitioning(true);
      setAnswer(currentIndex, value);
      window.setTimeout(() => setTransitioning(false), 280);
    },
    [currentIndex, setAnswer, transitioning],
  );

  if (!disclaimerAccepted) {
    return (
      <PageShell showDisclaimer={false}>
        <DisclaimerGate onAccept={acceptDisclaimer} />
      </PageShell>
    );
  }

  if (!question) {
    return (
      <PageShell showDisclaimer={false}>
        <p className="text-center text-sm text-dawn-muted">読み込み中…</p>
      </PageShell>
    );
  }

  return (
    <PageShell showDisclaimer={false}>
      <section
        className={`rounded-2xl border border-dawn-border bg-dawn-card p-6 shadow-sm transition-opacity duration-300 sm:p-8 ${transitioning ? "opacity-80" : "opacity-100"}`}
        aria-live="polite"
      >
        <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        {partLabel && (
          <p className="mb-4 text-xs font-medium text-dawn-muted">{partLabel}</p>
        )}
        <p className="mb-6 min-h-[4.5em] text-base font-medium leading-relaxed sm:text-lg">
          {question.text}
        </p>
        <AnswerButtons
          onSelect={handleSelect}
          disabled={transitioning}
          selected={currentAnswer}
        />
        <p className="mt-5 text-center text-xs text-dawn-muted">
          数字を選ぶと、自動的に次の質問へ進みます
        </p>
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="mt-6 w-full text-center text-xs text-dawn-muted underline-offset-2 hover:text-dawn-text hover:underline"
          >
            1つ前の質問に戻る
          </button>
        )}
      </section>
    </PageShell>
  );
}
