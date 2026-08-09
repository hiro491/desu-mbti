"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { questions } from "@/data/questions";
import {
  getTotalPages,
  isPageComplete,
} from "@/lib/question-pages";
import { buildDiagnosisResultRecord, buildDemographics } from "@/lib/diagnosis-record";
import { computeDiagnosis } from "@/lib/scoring";
import type { AgeGroup, Gender } from "@/data/demographics";
import type {
  AnswerValue,
  DiagnosisResultRecord,
  DiagnosisScores,
  DiagnosisType,
} from "@/types/diagnosis";

const ANSWERS_KEY = "desu-mbti-answers-v6";
const RESULT_KEY = "desu-mbti-result-v6";
const RECORD_KEY = "desu-mbti-record-v4";
const PAGE_KEY = "desu-mbti-page-v6";
const DEMOGRAPHICS_KEY = "desu-mbti-demographics-v1";
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
  goToPage: (page: number) => void;
  isCurrentPageComplete: boolean;
  reset: () => void;
  diagnosis: DiagnosisScores | null;
  resultRecord: DiagnosisResultRecord | null;
  resultType: DiagnosisType | null;
  isComplete: boolean;
  gender: Gender | null;
  ageGroup: AgeGroup | null;
  setGender: (gender: Gender) => void;
  setAgeGroup: (ageGroup: AgeGroup) => void;
  isDemographicsComplete: boolean;
  submitDemographics: () => DiagnosisResultRecord | null;
}

const DiagnosisContext = createContext<DiagnosisContextValue | null>(null);

function emptyAnswers(): (AnswerValue | undefined)[] {
  return Array(questions.length).fill(undefined);
}

function readStoredAnswers(): (AnswerValue | undefined)[] {
  if (typeof window === "undefined") return emptyAnswers();
  try {
    const raw = sessionStorage.getItem(ANSWERS_KEY);
    if (!raw) return emptyAnswers();
    const parsed = JSON.parse(raw) as (AnswerValue | undefined)[];
    if (!Array.isArray(parsed) || parsed.length !== questions.length) {
      return emptyAnswers();
    }
    return parsed;
  } catch {
    return emptyAnswers();
  }
}

function readStoredPage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(PAGE_KEY);
    if (!raw) return 0;
    const page = Number.parseInt(raw, 10);
    if (Number.isNaN(page)) return 0;
    return Math.min(Math.max(page, 0), getTotalPages() - 1);
  } catch {
    return 0;
  }
}

function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false;
  return (
    sessionStorage.getItem(ANSWERS_KEY) !== null ||
    sessionStorage.getItem(STARTED_AT_KEY) !== null
  );
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

function saveDemographics(gender: Gender | null, ageGroup: AgeGroup | null) {
  if (gender && ageGroup) {
    sessionStorage.setItem(DEMOGRAPHICS_KEY, JSON.stringify({ gender, ageGroup }));
    return;
  }
  sessionStorage.removeItem(DEMOGRAPHICS_KEY);
}

function readStoredDemographics(): {
  gender: Gender | null;
  ageGroup: AgeGroup | null;
} {
  if (typeof window === "undefined") {
    return { gender: null, ageGroup: null };
  }
  try {
    const raw = sessionStorage.getItem(DEMOGRAPHICS_KEY);
    if (!raw) return { gender: null, ageGroup: null };
    const parsed = JSON.parse(raw) as { gender?: Gender; ageGroup?: AgeGroup };
    return {
      gender: parsed.gender ?? null,
      ageGroup: parsed.ageGroup ?? null,
    };
  } catch {
    return { gender: null, ageGroup: null };
  }
}

function clearSessionKeys() {
  sessionStorage.removeItem(ANSWERS_KEY);
  sessionStorage.removeItem(RESULT_KEY);
  sessionStorage.removeItem(RECORD_KEY);
  sessionStorage.removeItem(PAGE_KEY);
  sessionStorage.removeItem(DEMOGRAPHICS_KEY);
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
  demographics?: ReturnType<typeof buildDemographics>,
): DiagnosisResultRecord | null {
  const diagnosis = computeDiagnosis(answers);
  if (!diagnosis) return null;

  const existing = readStoredRecord();
  const record = buildDiagnosisResultRecord(answers, {
    startedAt: getStartedAt(),
    completedAt: demographics ? new Date().toISOString() : existing?.completedAt,
    disclaimerAccepted,
    scores: diagnosis,
    id: existing?.id,
    demographics: demographics ?? existing?.demographics,
  });

  if (!record) return null;

  saveDiagnosis(diagnosis);
  saveRecord(record);
  return record;
}

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<(AnswerValue | undefined)[]>(() =>
    typeof window === "undefined" ? emptyAnswers() : readStoredAnswers(),
  );
  const [currentPage, setCurrentPage] = useState(() =>
    typeof window === "undefined" ? 0 : readStoredPage(),
  );
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    () => typeof window === "undefined" ? false : hasStoredSession(),
  );
  const [gender, setGenderState] = useState<Gender | null>(() =>
    typeof window === "undefined" ? null : readStoredDemographics().gender,
  );
  const [ageGroup, setAgeGroupState] = useState<AgeGroup | null>(() =>
    typeof window === "undefined" ? null : readStoredDemographics().ageGroup,
  );

  const totalPages = getTotalPages();

  const setGender = useCallback((value: Gender) => {
    setGenderState(value);
  }, []);

  const setAgeGroup = useCallback((value: AgeGroup) => {
    setAgeGroupState(value);
  }, []);

  useEffect(() => {
    saveDemographics(gender, ageGroup);
  }, [gender, ageGroup]);

  useEffect(() => {
    const stored = readStoredAnswers();
    if (stored.some((answer) => answer !== undefined)) {
      persistCompletedRecord(stored, hasStoredSession());
    }
  }, []);

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

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(() => {
        const next = Math.min(Math.max(page, 0), totalPages - 1);
        savePage(next);
        return next;
      });
    },
    [totalPages],
  );

  const reset = useCallback(() => {
    setAnswers(emptyAnswers());
    setCurrentPage(0);
    setDisclaimerAccepted(false);
    setGenderState(null);
    setAgeGroupState(null);
    clearSessionKeys();
  }, []);

  const submitDemographics = useCallback(() => {
    if (!gender || !ageGroup) return null;
    const demographics = buildDemographics(gender, ageGroup);
    return persistCompletedRecord(answers, disclaimerAccepted, demographics);
  }, [answers, ageGroup, disclaimerAccepted, gender]);

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

  const isDemographicsComplete = gender !== null && ageGroup !== null;

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
      goToPage,
      isCurrentPageComplete,
      reset,
      diagnosis,
      resultRecord,
      resultType: diagnosis?.type ?? null,
      isComplete,
      gender,
      ageGroup,
      setGender,
      setAgeGroup,
      isDemographicsComplete,
      submitDemographics,
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
      goToPage,
      isCurrentPageComplete,
      reset,
      diagnosis,
      resultRecord,
      isComplete,
      gender,
      ageGroup,
      setGender,
      setAgeGroup,
      isDemographicsComplete,
      submitDemographics,
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
