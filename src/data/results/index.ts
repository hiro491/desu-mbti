import type { DiagnosisType } from "@/types/diagnosis";
import { CHARACTER_IMAGE_VERSION } from "@/lib/site";
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
  const result = results[type];
  return {
    ...result,
    imagePath: `${result.imagePath}?v=${CHARACTER_IMAGE_VERSION}`,
  };
}
