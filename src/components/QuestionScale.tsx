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
  7: "h-10 w-10",
  6: "h-8 w-8",
  5: "h-7 w-7",
  4: "h-5 w-5",
  3: "h-7 w-7",
  2: "h-8 w-8",
  1: "h-10 w-10",
};

interface QuestionScaleProps {
  selected?: AnswerValue;
  onSelect: (value: AnswerValue) => void;
}

export function QuestionScale({ selected, onSelect }: QuestionScaleProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {VALUES.map((value) => {
          const isAgree = value > 4;
          const isDisagree = value < 4;
          const isNeutral = value === 4;
          const isSelected = selected === value;

          let ring =
            "border-2 border-dawn-neutral bg-gray-100 hover:border-gray-500";
          if (isSelected) {
            if (isAgree) ring = "border-2 border-dawn-accent bg-dawn-accent scale-110";
            else if (isDisagree)
              ring = "border-2 border-dawn-lavender bg-dawn-lavender scale-110";
            else ring = "border-2 border-gray-500 bg-gray-400 scale-110";
          } else if (isAgree) {
            ring =
              "border-2 border-dawn-accent bg-dawn-accent/20 hover:bg-dawn-accent/35";
          } else if (isDisagree) {
            ring =
              "border-2 border-dawn-lavender bg-dawn-lavender/20 hover:bg-dawn-lavender/35";
          } else if (isNeutral) {
            ring = "border-2 border-gray-400 bg-gray-100 hover:border-gray-500";
          }

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              aria-label={LABELS[value]}
              aria-pressed={isSelected}
              className={`shrink-0 rounded-full transition-all active:scale-95 ${SIZES[value]} ${ring}`}
            />
          );
        })}
      </div>
      <div className="mt-2.5 flex justify-between text-xs font-semibold sm:text-sm">
        <span className="text-dawn-accent">そう思う</span>
        <span className="text-dawn-lavender">そう思わない</span>
      </div>
    </div>
  );
}
