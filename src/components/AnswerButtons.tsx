"use client";

import type { AnswerValue } from "@/types/diagnosis";

const VALUES: AnswerValue[] = [1, 2, 3, 4, 5];

interface AnswerButtonsProps {
  onSelect: (value: AnswerValue) => void;
  disabled?: boolean;
  selected?: AnswerValue;
}

export function AnswerButtons({ onSelect, disabled, selected }: AnswerButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {VALUES.map((value) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(value)}
            aria-label={`${value}：${LABEL_SHORT[value]}`}
            aria-pressed={selected === value}
            className={`flex aspect-square items-center justify-center rounded-xl border text-base font-semibold transition-all active:scale-[0.96] disabled:opacity-50 sm:text-lg ${
              selected === value
                ? "border-dawn-accent bg-dawn-accent text-dawn-navy-deep"
                : "border-dawn-border bg-dawn-surface text-dawn-text hover:border-dawn-accent/60 hover:bg-dawn-accent-soft"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[0.65rem] leading-snug text-dawn-muted sm:text-xs">
        <span>
          <span className="font-semibold text-dawn-text">1</span>
          <br />
          全く当てはまらない
        </span>
        <span className="text-center">
          <span className="font-semibold text-dawn-text">3</span>
          <br />
          どちらとも言えない
        </span>
        <span className="text-right">
          <span className="font-semibold text-dawn-text">5</span>
          <br />
          非常に当てはまる
        </span>
      </div>
    </div>
  );
}

const LABEL_SHORT: Record<AnswerValue, string> = {
  1: "全く当てはまらない",
  2: "あまり当てはまらない",
  3: "どちらとも言えない",
  4: "かなり当てはまる",
  5: "非常に当てはまる",
};
