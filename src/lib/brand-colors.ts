import type { DimensionKey } from "@/types/diagnosis";

export const BRAND = {
  sumi: "#3C3B53",
  azuki: "#392220",
  odo: "#564510",
  sumiLight: "#6B6A7F",
} as const;

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  FA: BRAND.sumi,
  SN: BRAND.azuki,
  IC: BRAND.odo,
  TN: BRAND.sumiLight,
};
