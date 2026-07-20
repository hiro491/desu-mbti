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
import { buildDiagnosisResultRecord } from "@/lib/diagnosis-record";
import { computeDiagnosis } from "@/lib/scoring";
import type {
  AnswerValue,
  DiagnosisResultRecord,
  DiagnosisScores,
  DiagnosisType,
} from "@/types/diagnosis";

const ANSWERS_KEY = "desu-mbti-answers-v3";
const RESULT_KEY = "desu-mbti-result-v3";
const RECORD_KEY = "desu-mbti-record-v1";
const PAGE_KEY = "desu-mbti-page-v3";
const STARTED_AT_KEY = "desu-mbti-started-at-v1";

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
  resultRecord: DiagnosisResultRecord | null;
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

function saveRecord(record: DiagnosisResultRecord) {
  sessionStorage.setItem(RECORD_KEY, JSON.stringify(record));
}

function savePage(page: number) {
  sessionStorage.setItem(PAGE_KEY, String(page));
}

function getStartedAt(): string {
  const existing = sessionStorage.getItem(STARTED_AT_KEY);
  if (existing) return existing;
  const startedAt = new Date().toISOString();
  sessionStorage.setItem(STARTED_AT_KEY, startedAt);
  return startedAt;
}

function clearSessionKeys() {
  sessionStorage.removeItem(ANSWERS_KEY);
  sessionStorage.removeItem(RESULT_KEY);
  sessionStorage.removeItem(RECORD_KEY);
  sessionStorage.removeItem(PAGE_KEY);
  sessionStorage.removeItem(STARTED_AT_KEY);
}

function readStoredRecord(): DiagnosisResultRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RECORD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosisResultRecord;
  } catch {
    return null;
  }
}

function persistCompletedRecord(
  answers: (AnswerValue | undefined)[],
  disclaimerAccepted: boolean,
): DiagnosisResultRecord | null {
  const diagnosis = computeDiagnosis(answers);
  if (!diagnosis) return null;

  const existing = readStoredRecord();
  const record = buildDiagnosisResultRecord(answers, {
    startedAt: getStartedAt(),
    completedAt: existing?.completedAt,
    disclaimerAccepted,
    scores: diagnosis,
    id: existing?.id,
  });

  if (!record) return null;

  saveDiagnosis(diagnosis);
  saveRecord(record);
  return record;
}

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<(AnswerValue | undefined)[]>(
    emptyAnswers,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const totalPages = getTotalPages();

  const acceptDisclaimer = useCallback(() => {
    getStartedAt();
    setDisclaimerAccepted(true);
  }, []);

  const setAnswer = useCallback((index: number, value: AnswerValue) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      saveAnswers(next);
      persistCompletedRecord(next, true);
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
    clearSessionKeys();
  }, []);

  const diagnosis = useMemo(() => computeDiagnosis(answers), [answers]);

  const resultRecord = useMemo(() => {
    if (!diagnosis) return null;
    const stored = readStoredRecord();
    if (stored) return stored;
    return buildDiagnosisResultRecord(answers, {
      startedAt: getStartedAt(),
      disclaimerAccepted,
      scores: diagnosis,
    });
  }, [answers, disclaimerAccepted, diagnosis]);

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
      resultRecord,
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
      resultRecord,
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

export function loadStoredResultRecord(): DiagnosisResultRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RECORD_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosisResultRecord;
  } catch {
    return null;
  }
}
