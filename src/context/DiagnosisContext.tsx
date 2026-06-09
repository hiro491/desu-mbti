"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { questions } from "@/data/questions";
import {
  getTotalPages,
  isPageComplete,
} from "@/lib/question-pages";
import { computeDiagnosis } from "@/lib/scoring";
import type { AnswerValue, DiagnosisScores, DiagnosisType } from "@/types/diagnosis";

const ANSWERS_KEY = "desu-mbti-answers-v3";
const RESULT_KEY = "desu-mbti-result-v3";
const PAGE_KEY = "desu-mbti-page-v3";

interface DiagnosisContextValue {
  answers: (AnswerValue | undefined)[];
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => void;
  setAnswer: (index: number, value: AnswerValue) => void;
  goNextPage: () => void;
  goPrevPage: () => void;
  isCurrentPageComplete: boolean;
  reset: () => void;
  diagnosis: DiagnosisScores | null;
  resultType: DiagnosisType | null;
  isComplete: boolean;
}

const DiagnosisContext = createContext<DiagnosisContextValue | null>(null);

function emptyAnswers(): (AnswerValue | undefined)[] {
  return Array(questions.length).fill(undefined);
}

function saveAnswers(answers: (AnswerValue | undefined)[]) {
  sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

function saveDiagnosis(diagnosis: DiagnosisScores) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(diagnosis));
}

function savePage(page: number) {
  sessionStorage.setItem(PAGE_KEY, String(page));
}

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<(AnswerValue | undefined)[]>(
    emptyAnswers,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const totalPages = getTotalPages();

  const acceptDisclaimer = useCallback(() => {
    setDisclaimerAccepted(true);
  }, []);

  const setAnswer = useCallback((index: number, value: AnswerValue) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      saveAnswers(next);
      const diagnosis = computeDiagnosis(next);
      if (diagnosis) saveDiagnosis(diagnosis);
      return next;
    });
  }, []);

  const goNextPage = useCallback(() => {
    setCurrentPage((p) => {
      const next = Math.min(p + 1, totalPages - 1);
      savePage(next);
      return next;
    });
  }, [totalPages]);

  const goPrevPage = useCallback(() => {
    setCurrentPage((p) => {
      const next = Math.max(p - 1, 0);
      savePage(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(emptyAnswers());
    setCurrentPage(0);
    setDisclaimerAccepted(false);
    sessionStorage.removeItem(ANSWERS_KEY);
    sessionStorage.removeItem(RESULT_KEY);
    sessionStorage.removeItem(PAGE_KEY);
  }, []);

  const diagnosis = useMemo(() => computeDiagnosis(answers), [answers]);

  const isComplete = useMemo(
    () => answers.every((a) => a !== undefined),
    [answers],
  );

  const isCurrentPageComplete = useMemo(
    () => isPageComplete(currentPage, answers),
    [currentPage, answers],
  );

  const value = useMemo(
    () => ({
      answers,
      currentPage,
      totalPages,
      totalQuestions: questions.length,
      disclaimerAccepted,
      acceptDisclaimer,
      setAnswer,
      goNextPage,
      goPrevPage,
      isCurrentPageComplete,
      reset,
      diagnosis,
      resultType: diagnosis?.type ?? null,
      isComplete,
    }),
    [
      answers,
      currentPage,
      totalPages,
      disclaimerAccepted,
      acceptDisclaimer,
      setAnswer,
      goNextPage,
      goPrevPage,
      isCurrentPageComplete,
      reset,
      diagnosis,
      isComplete,
    ],
  );

  return (
    <DiagnosisContext.Provider value={value}>
      {children}
    </DiagnosisContext.Provider>
  );
}

export function useDiagnosis() {
  const ctx = useContext(DiagnosisContext);
  if (!ctx) {
    throw new Error("useDiagnosis must be used within DiagnosisProvider");
  }
  return ctx;
}

export function loadStoredDiagnosis(): DiagnosisScores | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosisScores;
  } catch {
    return null;
  }
}
