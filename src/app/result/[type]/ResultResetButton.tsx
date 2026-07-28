"use client";

import Link from "next/link";
import { useDiagnosis } from "@/context/DiagnosisContext";

export function ResultResetButton() {
  const { reset } = useDiagnosis();

  return (
    <Link
      href="/question"
      onClick={() => reset()}
      className="btn-gray inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium"
    >
      トップに戻る（もう一度診断する）
    </Link>
  );
}
