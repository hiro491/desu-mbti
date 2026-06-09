/** 次元1: 死への情緒 */
export type EmotionPole = "F" | "A";
/** 次元2: 死後の世界観 */
export type CognitionPole = "S" | "N";
/** 次元3: 他者との距離 */
export type RelationPole = "I" | "C";
/** 次元4: 終末期のスタンス（タツトリ / ノトナレ） */
export type ActionPole = "T" | "N";

export type DimensionKey = "FA" | "SN" | "IC" | "TN";

export type DiagnosisType =
  | "FSIT"
  | "FSIN"
  | "FSCT"
  | "FSCN"
  | "FNIT"
  | "FNIN"
  | "FNCT"
  | "FNCN"
  | "ASIT"
  | "ASIN"
  | "ASCT"
  | "ASCN"
  | "ANIT"
  | "ANIN"
  | "ANCT"
  | "ANCN";

/** 1=全くそう思わない … 7=非常にそう思う */
export type AnswerValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Question {
  id: string;
  text: string;
  dimension: DimensionKey;
  poleOnAgree: EmotionPole | CognitionPole | RelationPole | ActionPole;
  reversed?: boolean;
}

export interface DimensionPercentages {
  FA: { F: number; A: number };
  SN: { S: number; N: number };
  IC: { I: number; C: number };
  TN: { T: number; N: number };
}

export interface DiagnosisScores {
  raw: {
    FA: { F: number; A: number };
    SN: { S: number; N: number };
    IC: { I: number; C: number };
    TN: { T: number; N: number };
  };
  percent: DimensionPercentages;
  type: DiagnosisType;
  typeDisplay: string;
}

export const DIAGNOSIS_TYPES: DiagnosisType[] = [
  "FSIT",
  "FSIN",
  "FSCT",
  "FSCN",
  "FNIT",
  "FNIN",
  "FNCT",
  "FNCN",
  "ASIT",
  "ASIN",
  "ASCT",
  "ASCN",
  "ANIT",
  "ANIN",
  "ANCT",
  "ANCN",
];

export function isDiagnosisType(value: string): value is DiagnosisType {
  return (DIAGNOSIS_TYPES as string[]).includes(value);
}

export function formatTypeDisplay(type: DiagnosisType): string {
  return `${type[0]}-${type[1]}-${type[2]}-${type[3]}`;
}

export const DIMENSION_META: Record<
  DimensionKey,
  { left: string; right: string; leftKey: string; rightKey: string }
> = {
  FA: {
    left: "不安・抗い",
    right: "受容・自然体",
    leftKey: "F",
    rightKey: "A",
  },
  SN: {
    left: "魂の存続",
    right: "無・自然還元",
    leftKey: "S",
    rightKey: "N",
  },
  IC: {
    left: "個の完結",
    right: "絆の継続",
    leftKey: "I",
    rightKey: "C",
  },
  TN: {
    left: "整列・準備",
    right: "体験・開放",
    leftKey: "T",
    rightKey: "N",
  },
};
