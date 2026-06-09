interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="mb-6">
      <div className="mb-1.5 flex justify-between text-xs text-dawn-muted">
        <span>
          質問 {current} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-dawn-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-dawn-accent to-dawn-accent-light transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
