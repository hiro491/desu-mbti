import { DIMENSION_META, type DimensionPercentages } from "@/types/diagnosis";

interface DimensionBarsProps {
  percent: DimensionPercentages;
}

export function DimensionBars({ percent }: DimensionBarsProps) {
  const keys = ["FA", "SN", "IC", "TN"] as const;

  return (
    <div className="space-y-4">
      <p className="text-xs text-dawn-muted">
        あなたの傾向（％は「今の状態」の目安です）
      </p>
      {keys.map((key) => {
        const meta = DIMENSION_META[key];
        const values = percent[key] as Record<string, number>;
        const leftPct = values[meta.leftKey];
        const rightPct = values[meta.rightKey];

        return (
          <div key={key}>
            <div className="flex h-2 overflow-hidden rounded-full bg-dawn-border">
              <div
                className="bg-dawn-accent/80 transition-all"
                style={{ width: `${leftPct}%` }}
              />
              <div
                className="bg-dawn-surface transition-all"
                style={{ width: `${rightPct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[0.65rem] text-dawn-muted">
              <span>
                {meta.left} {leftPct}%
              </span>
              <span>
                {meta.right} {rightPct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
