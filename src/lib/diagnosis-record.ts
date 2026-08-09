import type { AgeGroup, Gender } from "@/data/demographics";
import { AGE_GROUP_OPTIONS, GENDER_OPTIONS } from "@/data/demographics";
import { questions } from "@/data/questions";
import { getResult } from "@/data/results";
import { computeDiagnosis } from "@/lib/scoring";
import type {
  AnswerValue,
  DiagnosisDemographics,
  DiagnosisResultRecord,
  DiagnosisScores,
} from "@/types/diagnosis";
import { DIAGNOSIS_SCHEMA_VERSION } from "@/types/diagnosis";

function toDemographics(
  gender: Gender,
  ageGroup: AgeGroup,
): DiagnosisDemographics {
  const genderLabel =
    GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? gender;
  const ageGroupLabel =
    AGE_GROUP_OPTIONS.find((option) => option.value === ageGroup)?.label ??
    ageGroup;

  return { gender, ageGroup, genderLabel, ageGroupLabel };
}

function createRecordId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `diag-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildDiagnosisResultRecord(
  answers: (AnswerValue | undefined)[],
  options: {
    startedAt: string;
    completedAt?: string;
    disclaimerAccepted: boolean;
    scores?: DiagnosisScores;
    id?: string;
    demographics?: DiagnosisDemographics;
  },
): DiagnosisResultRecord | null {
  const scores = options.scores ?? computeDiagnosis(answers);
  if (!scores) return null;
  if (answers.some((value) => value === undefined)) return null;

  const result = getResult(scores.type);
  const completedAt = options.completedAt ?? new Date().toISOString();

  return {
    schemaVersion: DIAGNOSIS_SCHEMA_VERSION,
    id: options.id ?? createRecordId(),
    startedAt: options.startedAt,
    completedAt,
    disclaimerAccepted: options.disclaimerAccepted,
    answers: questions.map((question, index) => ({
      questionId: question.id,
      questionIndex: index,
      questionText: question.text,
      dimension: question.dimension,
      poleOnAgree: question.poleOnAgree,
      reversed: question.reversed,
      value: answers[index] as AnswerValue,
    })),
    scores,
    result: {
      type: result.type,
      typeDisplay: scores.typeDisplay,
      flower: result.flower,
      name: result.name,
      catchphrase: result.catchphrase,
    },
    ...(options.demographics ? { demographics: options.demographics } : {}),
  };
}

export function buildDemographics(
  gender: Gender,
  ageGroup: AgeGroup,
): DiagnosisDemographics {
  return toDemographics(gender, ageGroup);
}

export function isDiagnosisResultRecord(
  value: unknown,
): value is DiagnosisResultRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<DiagnosisResultRecord>;
  return (
    record.schemaVersion === DIAGNOSIS_SCHEMA_VERSION &&
    typeof record.id === "string" &&
    typeof record.startedAt === "string" &&
    typeof record.completedAt === "string" &&
    Array.isArray(record.answers) &&
    !!record.scores &&
    !!record.result
  );
}
