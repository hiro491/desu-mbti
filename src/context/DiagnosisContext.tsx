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
import { computeDiagnosis } from "@/lib/scoring";
import type { AnswerValue, DiagnosisScores, DiagnosisType } from "@/types/diagnosis";

const ANSWERS_KEY = "desu-mbti-answers-v2";
const RESULT_KEY = "desu-mbti-result-v2";

interface DiagnosisContextValue {
  answers: (AnswerValue | undefined)[];
  currentIndex: number;
  totalQuestions: number;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => void;
  setAnswer: (index: number, value: AnswerValue) => void;
  goBack: () => void;
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

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<(AnswerValue | undefined)[]>(
    emptyAnswers,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

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
    if (index < questions.length - 1) {
      setCurrentIndex(index + 1);
    }
  }, []);

  const goBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const reset = useCallback(() => {
    setAnswers(emptyAnswers());
    setCurrentIndex(0);
    setDisclaimerAccepted(false);
    sessionStorage.removeItem(ANSWERS_KEY);
    sessionStorage.removeItem(RESULT_KEY);
  }, []);

  const diagnosis = useMemo(() => computeDiagnosis(answers), [answers]);

  const isComplete = useMemo(
    () => answers.every((a) => a !== undefined),
    [answers],
  );

  const value = useMemo(
    () => ({
      answers,
      currentIndex,
      totalQuestions: questions.length,
      disclaimerAccepted,
      acceptDisclaimer,
      setAnswer,
      goBack,
      reset,
      diagnosis,
      resultType: diagnosis?.type ?? null,
      isComplete,
    }),
    [
      answers,
      currentIndex,
      disclaimerAccepted,
      acceptDisclaimer,
      setAnswer,
      goBack,
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
