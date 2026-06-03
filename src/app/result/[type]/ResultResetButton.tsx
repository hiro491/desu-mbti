"use client";

import Link from "next/link";
import { useDiagnosis } from "@/context/DiagnosisContext";

export function ResultResetButton() {
  const { reset } = useDiagnosis();

  return (
    <Link
      href="/question"
      onClick={() => reset()}
      className="inline-flex items-center justify-center rounded-xl border border-dawn-border bg-transparent px-6 py-3 text-sm font-medium text-dawn-muted transition hover:border-dawn-muted hover:text-dawn-text"
    >
      トップに戻る（もう一度診断する）
    </Link>
  );
}
