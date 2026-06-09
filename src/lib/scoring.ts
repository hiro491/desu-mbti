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

/**
 * 50%同点時の振り分け（日本人の本音補正）
 * 全次元が同点のときのデフォルトタイプは A-S-C-N（ASCN）
 */
const TIE_BREAK_POLE: Record<DimensionKey, string> = {
  FA: "A",
  SN: "S",
  IC: "C",
  TN: "N",
};

const DIMENSION_POLES: Record<DimensionKey, [string, string]> = {
  FA: ["F", "A"],
  SN: ["S", "N"],
  IC: ["I", "C"],
  TN: ["T", "N"],
};

export const DEFAULT_TIE_TYPE: DiagnosisType = "ASCN";

function centeredWeight(value: AnswerValue, reversed?: boolean): number {
  const centered = value - 4;
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

function isDimensionTied(
  dimension: DimensionKey,
  raw: RawScores,
  percentLeft: number,
): boolean {
  const [left, right] = DIMENSION_POLES[dimension];
  const pair = raw[dimension] as Record<string, number>;
  return pair[left] === pair[right] || percentLeft === 50;
}

function pickPoleForDimension(
  dimension: DimensionKey,
  raw: RawScores,
  percentLeft: number,
): string {
  const [left, right] = DIMENSION_POLES[dimension];
  const pair = raw[dimension] as Record<string, number>;

  if (isDimensionTied(dimension, raw, percentLeft)) {
    return TIE_BREAK_POLE[dimension];
  }
  if (pair[left] > pair[right]) return left;
  return right;
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

  const emotion = pickPoleForDimension("FA", raw, percent.FA.F);
  const cognition = pickPoleForDimension("SN", raw, percent.SN.S);
  const relation = pickPoleForDimension("IC", raw, percent.IC.I);
  const action = pickPoleForDimension("TN", raw, percent.TN.T);

  const type = `${emotion}${cognition}${relation}${action}` as DiagnosisType;

  return {
    raw,
    percent,
    type,
    typeDisplay: formatTypeDisplay(type),
  };
}
