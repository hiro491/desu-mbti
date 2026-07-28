import type { DiagnosisType } from "@/types/diagnosis";
import { anTypes } from "./an-types";
import { asTypes } from "./as-types";
import { fnTypes } from "./fn-types";
import { fsTypes } from "./fs-types";
import type { TypeResult } from "./types";

export type { EndOfLifeStep, TypeResult, WorldviewElement } from "./types";

export const results: Record<DiagnosisType, TypeResult> = {
  ...fsTypes,
  ...fnTypes,
  ...asTypes,
  ...anTypes,
};

export function getResult(type: DiagnosisType): TypeResult {
  return results[type];
}
