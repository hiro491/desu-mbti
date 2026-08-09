"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemographicsForm } from "@/components/DemographicsForm";
import { PageShell } from "@/components/PageShell";
import { useDiagnosis } from "@/context/DiagnosisContext";

export default function DemographicsPage() {
  const router = useRouter();
  const {
    isComplete,
    diagnosis,
    gender,
    ageGroup,
    setGender,
    setAgeGroup,
    isDemographicsComplete,
    submitDemographics,
  } = useDiagnosis();
  const [showIncompleteHint, setShowIncompleteHint] = useState(false);

  useEffect(() => {
    if (!isComplete || !diagnosis?.type) {
      router.replace("/question");
    }
  }, [diagnosis?.type, isComplete, router]);

  const handleSubmit = () => {
    if (!isDemographicsComplete || !diagnosis?.type) {
      setShowIncompleteHint(true);
      return;
    }
    const record = submitDemographics();
    if (!record) {
      setShowIncompleteHint(true);
      return;
    }
    router.replace(`/result/${record.scores.type}`);
  };

  if (!isComplete || !diagnosis?.type) {
    return null;
  }

  return (
    <PageShell showDisclaimer={false} layout="scroll">
      <div className="min-h-0 flex-1 overflow-y-auto pb-28">
        <section className="rounded-2xl border border-dawn-border bg-dawn-card p-5 shadow-sm sm:p-6">
          <DemographicsForm
            gender={gender}
            ageGroup={ageGroup}
            onGenderChange={setGender}
            onAgeGroupChange={setAgeGroup}
          />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-dawn-border bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-xl">
          {showIncompleteHint && (
            <p className="mb-2 text-center text-xs text-dawn-muted">
              性別と年齢層の両方を選んでから進んでください。
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
