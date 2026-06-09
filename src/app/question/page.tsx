"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnswerValue } from "@/types/diagnosis";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import { PageShell } from "@/components/PageShell";
import { QuestionScale } from "@/components/QuestionScale";
import { StepProgressBar } from "@/components/StepProgressBar";
import { questions } from "@/data/questions";
import { useDiagnosis } from "@/context/DiagnosisContext";
import { getPageQuestionIndices } from "@/lib/question-pages";

export default function QuestionPage() {
  const router = useRouter();
  const {
    answers,
    currentPage,
    totalPages,
    setAnswer,
    goNextPage,
    goPrevPage,
    isCurrentPageComplete,
    isComplete,
    diagnosis,
    disclaimerAccepted,
    acceptDisclaimer,
  } = useDiagnosis();

  const [showIncompleteHint, setShowIncompleteHint] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const pageIndices = getPageQuestionIndices(currentPage);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    listRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const scrollToQuestion = useCallback((index: number) => {
    const container = listRef.current;
    const target = document.getElementById(`question-${index}`);
    if (!container || !target) return;

    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset = targetTop - containerTop + container.scrollTop - 24;

    container.scrollTo({ top: offset, behavior: "smooth" });
  }, []);

  const handleAnswer = useCallback(
    (index: number, value: AnswerValue) => {
      setAnswer(index, value);

      const nextUnanswered = pageIndices.find(
        (i) => i > index && answers[i] === undefined,
      );

      if (nextUnanswered !== undefined) {
        window.setTimeout(() => scrollToQuestion(nextUnanswered), 200);
      }
    },
    [answers, pageIndices, scrollToQuestion, setAnswer],
  );
  const isLastPage = currentPage === totalPages - 1;

  useEffect(() => {
    if (isComplete && diagnosis?.type) {
      router.replace(`/result/${diagnosis.type}`);
    }
  }, [isComplete, diagnosis?.type, router]);

  useEffect(() => {
    setShowIncompleteHint(false);
    scrollToTop();
    requestAnimationFrame(() => scrollToTop());
  }, [currentPage, scrollToTop]);

  if (!disclaimerAccepted) {
    return (
      <PageShell showDisclaimer={false}>
        <DisclaimerGate onAccept={acceptDisclaimer} />
      </PageShell>
    );
  }

  const handleNext = () => {
    if (!isCurrentPageComplete) {
      setShowIncompleteHint(true);
      const firstUnanswered = pageIndices.find((i) => answers[i] === undefined);
      if (firstUnanswered !== undefined) {
        scrollToQuestion(firstUnanswered);
      }
      return;
    }
    if (isLastPage && isComplete && diagnosis?.type) {
      router.replace(`/result/${diagnosis.type}`);
      return;
    }
    goNextPage();
  };

  return (
    <PageShell showDisclaimer={false} layout="scroll">
      <div className="flex shrink-0 items-center gap-3 pb-4">
        {currentPage > 0 ? (
          <button
            type="button"
            onClick={goPrevPage}
            className="shrink-0 text-xs font-medium text-dawn-accent hover:text-dawn-accent-light"
          >
            ← 前のページ
          </button>
        ) : (
          <span className="w-16 shrink-0" aria-hidden />
        )}
        <StepProgressBar currentStep={currentPage + 1} totalSteps={totalPages} />
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-28"
      >
        {pageIndices.map((index) => {
          const question = questions[index];
          return (
            <article
              key={question.id}
              id={`question-${index}`}
              className="border-b border-dawn-border/60 pb-8 last:border-b-0"
            >
              <p className="text-sm font-bold leading-relaxed text-dawn-text sm:text-base">
                {question.text}
              </p>
              <QuestionScale
                selected={answers[index]}
                onSelect={(value) => handleAnswer(index, value)}
              />
            </article>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-dawn-border bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-lg">
          {showIncompleteHint && (
            <p className="mb-2 text-center text-xs text-dawn-lavender">
              未回答の質問があります。すべて選んでから進んでください。
            </p>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-xl bg-dawn-accent py-3.5 text-sm font-bold text-white transition hover:bg-dawn-accent-light active:scale-[0.98]"
          >
            {isLastPage ? "結果を見る" : "次のページへ"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
