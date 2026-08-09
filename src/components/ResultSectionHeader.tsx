interface ResultSectionHeaderProps {
  number: number;
  title: string;
}

export function ResultSectionHeader({ number, title }: ResultSectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-sumi text-sm font-bold text-sumi"
        aria-hidden
      >
        {number}
      </span>
      <h3 className="text-lg font-bold text-sumi sm:text-xl">{title}</h3>
    </div>
  );
}
