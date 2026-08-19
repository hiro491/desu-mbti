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
  /** 集計対象外（アテンションチェック等） */
  excludeFromScoring?: boolean;
  /** アテンションチェックの正答（指定時のみ結果遷移前に検証） */
  attentionCheckAnswer?: AnswerValue;
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

export const DIAGNOSIS_SCHEMA_VERSION = 1 as const;

export interface DiagnosisAnswerEntry {
  questionId: string;
  questionIndex: number;
  questionText: string;
  dimension: DimensionKey;
  poleOnAgree: Question["poleOnAgree"];
  reversed?: boolean;
  value: AnswerValue;
}

export interface DiagnosisResultSummary {
  type: DiagnosisType;
  typeDisplay: string;
  flower: string;
  name: string;
  catchphrase: string;
}

import type {
  AgeGroup,
  BereavementExperience,
  Gender,
  MaritalStatus,
  Occupation,
  Residence,
} from "@/data/demographics";

export interface DiagnosisDemographics {
  ageGroup: AgeGroup;
  ageGroupLabel: string;
  gender: Gender;
  genderLabel: string;
  residence: Residence;
  residenceLabel: string;
  occupation: Occupation;
  occupationLabel: string;
  occupationOther?: string;
  maritalStatus: MaritalStatus;
  maritalStatusLabel: string;
  bereavementExperience: BereavementExperience;
  bereavementExperienceLabel: string;
}

/** 診断結果の完全データ（回答・スコア・タイプ情報・タイムスタンプ） */
export interface DiagnosisResultRecord {
  schemaVersion: typeof DIAGNOSIS_SCHEMA_VERSION;
  id: string;
  startedAt: string;
  completedAt: string;
  disclaimerAccepted: boolean;
  answers: DiagnosisAnswerEntry[];
  scores: DiagnosisScores;
  result: DiagnosisResultSummary;
  demographics?: DiagnosisDemographics;
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
