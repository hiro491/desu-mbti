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

          const ring = isSelected
            ? "border-2 border-gray-600 bg-gray-500 ring-2 ring-gray-300 ring-offset-1"
            : "border-2 border-gray-300 bg-gray-100 hover:border-gray-500 hover:bg-gray-200";

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              aria-label={LABELS[value]}
              aria-pressed={isSelected}
              className={`mx-auto rounded-full transition-colors active:scale-95 ${SIZES[value]} ${ring}`}
            />
          );
        })}
      </div>
      <div className="mt-2.5 flex justify-between px-0.5 text-xs font-semibold text-gray-600 sm:text-sm">
        <span>そう思う</span>
        <span>そう思わない</span>
      </div>
    </div>
  );
}
