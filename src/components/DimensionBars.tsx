import { DIMENSION_COLORS } from "@/lib/brand-colors";
import { DIMENSION_META, type DimensionKey, type DimensionPercentages } from "@/types/diagnosis";

interface DimensionBarsProps {
  percent: DimensionPercentages;
}

const DIMENSION_NAMES: Record<DimensionKey, string> = {
  FA: "感情",
  SN: "認知",
  IC: "関係",
  TN: "行動",
};

const keys: DimensionKey[] = ["FA", "SN", "IC", "TN"];

export function DimensionBars({ percent }: DimensionBarsProps) {
  return (
    <div className="space-y-8">
      {keys.map((key) => {
        const meta = DIMENSION_META[key];
        const values = percent[key] as Record<string, number>;
        const leftPct = values[meta.leftKey];
        const rightPct = values[meta.rightKey];
        const leftWins = leftPct >= rightPct;
        const dominantPct = leftWins ? leftPct : rightPct;
        const dominantLabel = leftWins ? meta.left : meta.right;
        const color = DIMENSION_COLORS[key];
        const thumbLeft = leftWins ? leftPct : 100 - rightPct;

        return (
          <div key={key}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-dawn-text sm:text-base">
                <span>{DIMENSION_NAMES[key]}: </span>
                <span style={{ color }}>{dominantPct}%</span>
                <span style={{ color }}> {dominantLabel}</span>
              </p>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dawn-border bg-white text-[10px] text-dawn-neutral"
                aria-hidden
              >
                ?
              </span>
            </div>

            <div className="relative h-3 rounded-full bg-dawn-border">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{
                  width: `${thumbLeft}%`,
                  backgroundColor: color,
                }}
              />
              <span
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-sm"
                style={{
                  left: `${thumbLeft}%`,
                  borderColor: color,
                }}
                aria-hidden
              />
            </div>

            <div className="mt-2 flex justify-between text-xs font-medium text-dawn-muted sm:text-sm">
              <span>{meta.left}</span>
              <span>{meta.right}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
