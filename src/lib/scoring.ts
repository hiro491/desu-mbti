import { questions } from "@/data/questions";
import type {
  AnswerValue,
  DiagnosisScores,
  DiagnosisType,
  DimensionKey,
  DimensionPercentages,
} from "@/types/diagnosis";
import { formatTypeDisplay } from "@/types/diagnosis";

type RawScores = DiagnosisScores["raw"];

function centeredWeight(value: AnswerValue, reversed?: boolean): number {
  const centered = value - 3;
  return reversed ? -centered : centered;
}

function addToRaw(
  raw: RawScores,
  dimension: DimensionKey,
  pole: string,
  weight: number,
) {
  const pair = raw[dimension] as Record<string, number>;
  pair[pole] += weight;
}

function toPercent(left: number, right: number): { left: number; right: number } {
  const adjLeft = Math.max(0, left);
  const adjRight = Math.max(0, right);
  const total = adjLeft + adjRight;
  if (total === 0) return { left: 50, right: 50 };
  const leftPct = Math.round((adjLeft / total) * 100);
  return { left: leftPct, right: 100 - leftPct };
}

function buildPercent(raw: RawScores): DimensionPercentages {
  const fa = toPercent(raw.FA.F, raw.FA.A);
  const sn = toPercent(raw.SN.S, raw.SN.N);
  const ic = toPercent(raw.IC.I, raw.IC.C);
  const tn = toPercent(raw.TN.T, raw.TN.N);
  return {
    FA: { F: fa.left, A: fa.right },
    SN: { S: sn.left, N: sn.right },
    IC: { I: ic.left, C: ic.right },
    TN: { T: tn.left, N: tn.right },
  };
}

function pickPole<T extends string>(
  raw: Record<string, number>,
  left: T,
  right: T,
  percentLeft: number,
): T {
  if (raw[left] > raw[right]) return left;
  if (raw[right] > raw[left]) return right;
  return percentLeft >= 50 ? left : right;
}

export function computeRawScores(
  answers: (AnswerValue | undefined)[],
): RawScores {
  const raw: RawScores = {
    FA: { F: 0, A: 0 },
    SN: { S: 0, N: 0 },
    IC: { I: 0, C: 0 },
    TN: { T: 0, N: 0 },
  };

  questions.forEach((q, i) => {
    const value = answers[i];
    if (value === undefined) return;
    const weight = centeredWeight(value, q.reversed);
    addToRaw(raw, q.dimension, q.poleOnAgree, weight);
  });

  return raw;
}

export function computeDiagnosis(
  answers: (AnswerValue | undefined)[],
): DiagnosisScores | null {
  if (answers.length !== questions.length) return null;
  if (answers.some((a) => a === undefined)) return null;

  const raw = computeRawScores(answers);
  const percent = buildPercent(raw);

  const emotion = pickPole(raw.FA, "F", "A", percent.FA.F);
  const cognition = pickPole(raw.SN, "S", "N", percent.SN.S);
  const relation = pickPole(raw.IC, "I", "C", percent.IC.I);
  const action = pickPole(raw.TN, "T", "N", percent.TN.T);

  const type = `${emotion}${cognition}${relation}${action}` as DiagnosisType;

  return {
    raw,
    percent,
    type,
    typeDisplay: formatTypeDisplay(type),
  };
}
