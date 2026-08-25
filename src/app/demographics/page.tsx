"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DemographicsForm } from "@/components/DemographicsForm";
import { PageShell } from "@/components/PageShell";
import { useDiagnosis } from "@/context/DiagnosisContext";
import { getFirstIncompleteDemographicSectionIndex } from "@/data/demographics";

export default function DemographicsPage() {
  const router = useRouter();
  const {
    isComplete,
    diagnosis,
    demographics,
    setDemographics,
    isDemographicsComplete,
    submitDemographics,
  } = useDiagnosis();
  const [showIncompleteHint, setShowIncompleteHint] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isComplete || !diagnosis?.type) {
      router.replace("/question");
    }
  }, [diagnosis?.type, isComplete, router]);

  const scrollToSection = useCallback((sectionIndex: number) => {
    const container = listRef.current;
    const target = document.getElementById(`demographic-${sectionIndex}`);
    if (!container || !target) return;

    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset = targetTop - containerTop + container.scrollTop - 24;

    container.scrollTo({ top: offset, behavior: "smooth" });
  }, []);

  const handleSubmit = () => {
    if (!isDemographicsComplete || !diagnosis?.type) {
      setShowIncompleteHint(true);
      const firstIncomplete =
        getFirstIncompleteDemographicSectionIndex(demographics);
      if (firstIncomplete !== undefined) {
        scrollToSection(firstIncomplete);
      }
      return;
    }
    const record = submitDemographics();
    if (!record) {
      setShowIncompleteHint(true);
      const firstIncomplete =
        getFirstIncompleteDemographicSectionIndex(demographics);
      if (firstIncomplete !== undefined) {
        scrollToSection(firstIncomplete);
      }
      return;
    }
    router.replace(`/result/${record.scores.type}`);
  };

  if (!isComplete || !diagnosis?.type) {
    return null;
  }

  return (
    <PageShell showDisclaimer={false} layout="scroll">
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-28"
      >
        <section className="rounded-2xl border border-dawn-border bg-dawn-card p-5 shadow-sm sm:p-6">
          <DemographicsForm
            value={demographics}
            onChange={setDemographics}
            scrollContainerRef={listRef}
          />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-dawn-border bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-xl">
          {showIncompleteHint && (
            <p className="mb-2 text-center text-xs text-dawn-muted">
              すべての必須項目（*）に回答してから進んでください。
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-gray w-full rounded-xl py-3.5 text-sm font-bold"
          >
            結果を見る
          </button>
        </div>
      </div>
    </PageShell>
  );
}
