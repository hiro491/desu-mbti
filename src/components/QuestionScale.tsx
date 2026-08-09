"use client";

import type { AnswerValue } from "@/types/diagnosis";

/** 左＝そう思う（7）… 右＝そう思わない（1） */
const VALUES: AnswerValue[] = [7, 6, 5, 4, 3, 2, 1];

const LABELS: Record<AnswerValue, string> = {
  7: "非常にそう思う",
  6: "そう思う",
  5: "ややそう思う",
  4: "どちらとも言えない",
  3: "ややそう思わない",
  2: "そう思わない",
  1: "全くそう思わない",
};

const SIZES: Record<AnswerValue, string> = {
  7: "h-9 w-9 sm:h-10 sm:w-10",
  6: "h-8 w-8",
  5: "h-7 w-7",
  4: "h-5 w-5 sm:h-6 sm:w-6",
  3: "h-7 w-7",
  2: "h-8 w-8",
  1: "h-9 w-9 sm:h-10 sm:w-10",
};

const CHECK_SIZES: Record<AnswerValue, string> = {
  7: "h-4 w-4 sm:h-5 sm:w-5",
  6: "h-3.5 w-3.5",
  5: "h-3 w-3",
  4: "h-2.5 w-2.5 sm:h-3 sm:w-3",
  3: "h-3 w-3",
  2: "h-3.5 w-3.5",
  1: "h-4 w-4 sm:h-5 sm:w-5",
};

type ScaleSide = "azuki" | "neutral" | "odo";

function getScaleSide(value: AnswerValue): ScaleSide {
  if (value >= 5) return "azuki";
  if (value === 4) return "neutral";
  return "odo";
}

function buttonClass(side: ScaleSide, isSelected: boolean): string {
  const base =
    "group mx-auto flex items-center justify-center rounded-full border-2 transition-colors active:scale-95";

  if (side === "azuki") {
    return isSelected
      ? `${base} border-azuki bg-azuki ring-2 ring-azuki/30 ring-offset-1`
      : `${base} border-azuki bg-white hover:bg-azuki/5`;
  }

  if (side === "odo") {
    return isSelected
      ? `${base} border-odo bg-odo ring-2 ring-odo/30 ring-offset-1`
      : `${base} border-odo bg-white hover:bg-odo/5`;
  }

  return isSelected
    ? `${base} border-dawn-neutral bg-dawn-neutral ring-2 ring-dawn-neutral/30 ring-offset-1`
    : `${base} border-dawn-neutral bg-white hover:bg-dawn-surface`;
}

function checkClass(side: ScaleSide, isSelected: boolean): string {
  const base = "transition-opacity duration-150";

  if (isSelected) {
    return `${base} text-white opacity-100`;
  }

  if (side === "azuki") {
    return `${base} text-azuki opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`;
  }

  if (side === "odo") {
    return `${base} text-odo opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`;
  }

  return `${base} text-dawn-neutral opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100`;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

interface QuestionScaleProps {
  selected?: AnswerValue;
  onSelect: (value: AnswerValue) => void;
}

export function QuestionScale({ selected, onSelect }: QuestionScaleProps) {
  return (
    <div className="mt-4 px-1">
      <div className="grid grid-cols-7 items-center gap-1 sm:gap-2">
        {VALUES.map((value) => {
          const isSelected = selected === value;
          const side = getScaleSide(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              aria-label={LABELS[value]}
              aria-pressed={isSelected}
              className={`${SIZES[value]} ${buttonClass(side, isSelected)}`}
            >
              <CheckIcon className={`${CHECK_SIZES[value]} ${checkClass(side, isSelected)}`} />
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 flex justify-between px-0.5 text-xs font-semibold sm:text-sm">
        <span className="text-azuki">そう思う</span>
        <span className="text-odo">そう思わない</span>
      </div>
    </div>
  );
}
