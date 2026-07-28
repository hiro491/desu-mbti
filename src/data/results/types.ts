import type { DiagnosisType } from "@/types/diagnosis";

export interface EndOfLifeStep {
  timing: "今すぐ" | "半年以内" | "将来";
  text: string;
}

export interface WorldviewElement {
  label: string;
  text: string;
}

export interface TypeResult {
  type: DiagnosisType;
  flower: string;
  name: string;
  catchphrase: string;
  basicInfo: string;
  flowerLanguage: string;
  publicFace: string;
  privateFace: string;
  familyDialogueHint: string;
  endOfLifeSteps: EndOfLifeStep[];
  worldview: WorldviewElement[];
  imagePath: string;
}
