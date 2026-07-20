import { questions } from "@/data/questions";
import { getResult } from "@/data/results";
import { computeDiagnosis } from "@/lib/scoring";
import type {
  AnswerValue,
  DiagnosisResultRecord,
  DiagnosisScores,
} from "@/types/diagnosis";
import { DIAGNOSIS_SCHEMA_VERSION } from "@/types/diagnosis";

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
      animal: result.animal,
      name: result.name,
      catchphrase: result.catchphrase,
    },
  };
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

export function downloadDiagnosisRecord(record: DiagnosisResultRecord): void {
  const blob = new Blob([JSON.stringify(record, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `diagnosis-${record.result.type}-${record.completedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadDiagnosisRecords(
  records: DiagnosisResultRecord[],
  filename = "diagnosis-results-all.json",
): void {
  const blob = new Blob([JSON.stringify(records, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function recordsToCsv(records: DiagnosisResultRecord[]): string {
  const headers = [
    "id",
    "completedAt",
    "type",
    "typeDisplay",
    "name",
    "animal",
    "catchphrase",
    "percent_FA_F",
    "percent_FA_A",
    "percent_SN_S",
    "percent_SN_N",
    "percent_IC_I",
    "percent_IC_C",
    "percent_TN_T",
    "percent_TN_N",
    "answers_json",
  ];

  const rows = records.map((record) => [
    record.id,
    record.completedAt,
    record.result.type,
    record.result.typeDisplay,
    record.result.name,
    record.result.animal,
    record.result.catchphrase,
    record.scores.percent.FA.F,
    record.scores.percent.FA.A,
    record.scores.percent.SN.S,
    record.scores.percent.SN.N,
    record.scores.percent.IC.I,
    record.scores.percent.IC.C,
    record.scores.percent.TN.T,
    record.scores.percent.TN.N,
    JSON.stringify(
      record.answers.map((answer) => ({
        id: answer.questionId,
        value: answer.value,
      })),
    ),
  ]);

  const escape = (value: string | number) => {
    const text = String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  return [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");
}

export function downloadDiagnosisCsv(
  records: DiagnosisResultRecord[],
  filename = "diagnosis-results-all.csv",
): void {
  const blob = new Blob([recordsToCsv(records)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
