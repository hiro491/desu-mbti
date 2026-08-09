import type { DiagnosisType } from "@/types/diagnosis";

export interface TypeGroup {
  id: "FS" | "FN" | "AS" | "AN";
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  types: DiagnosisType[];
}

export const TYPE_GROUPS: TypeGroup[] = [
  {
    id: "FS",
    title: "格式派",
    subtitle: "不安・抗い × 魂の存続",
    description:
      "終焉への不安を力に変え、魂や尊厳が続くと信じながら、自らの手で整え備えるタイプ群です。",
    accentColor: "#3C3B53",
    types: ["FSIT", "FSIN", "FSCT", "FSCN"],
  },
  {
    id: "FN",
    title: "現世派",
    subtitle: "不安・抗い × 無・自然還元",
    description:
      "この世の時間を大切にし、執着を手放しながらも、今を全力で生きるエネルギーを持つタイプ群です。",
    accentColor: "#392220",
    types: ["FNIT", "FNIN", "FNCT", "FNCN"],
  },
  {
    id: "AS",
    title: "精神派",
    subtitle: "受容・自然体 × 魂の存続",
    description:
      "死を自然な流れとして受け入れ、精神世界や絆の継続を大切にするタイプ群です。",
    accentColor: "#564510",
    types: ["ASIT", "ASIN", "ASCT", "ASCN"],
  },
  {
    id: "AN",
    title: "自然派",
    subtitle: "受容・自然体 × 無・自然還元",
    description:
      "執着なく自然に還ることを望み、形式よりも心の自由と体験を重んじるタイプ群です。",
    accentColor: "#6B6A7F",
    types: ["ANIT", "ANIN", "ANCT", "ANCN"],
  },
];

export function getTypeShortName(name: string): string {
  const match = name.match(/「([^」]+)」/);
  return match ? match[1] : name;
}

export function getTypeGroup(type: DiagnosisType): TypeGroup {
  const prefix = type.slice(0, 2) as TypeGroup["id"];
  return TYPE_GROUPS.find((group) => group.id === prefix) ?? TYPE_GROUPS[0];
}
