"use client";

import type { ReactNode } from "react";
import {
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  type AgeGroup,
  type Gender,
} from "@/data/demographics";

interface ChoiceButtonProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ChoiceButton({ selected, onClick, children }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        selected
          ? "btn-gray w-full rounded-full border-2 border-sumi px-3 py-2.5 text-sm font-bold"
          : "w-full rounded-full border-2 border-dawn-border bg-white px-3 py-2.5 text-sm font-medium text-dawn-text transition hover:border-sumi"
      }
    >
      {children}
    </button>
  );
}

interface DemographicsFormProps {
  gender: Gender | null;
  ageGroup: AgeGroup | null;
  onGenderChange: (value: Gender) => void;
  onAgeGroupChange: (value: AgeGroup) => void;
}

export function DemographicsForm({
  gender,
  ageGroup,
  onGenderChange,
  onAgeGroupChange,
}: DemographicsFormProps) {
  return (
    <div className="space-y-8">
      <section>
        <p className="mb-4 text-center text-sm font-bold text-dawn-text">
          あなたの性別は？
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {GENDER_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={gender === option.value}
              onClick={() => onGenderChange(option.value)}
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </section>

      <div className="border-t border-dawn-border" />

      <section>
        <p className="mb-4 text-center text-sm font-bold text-dawn-text">
          あなたの年齢層は？
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {AGE_GROUP_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={ageGroup === option.value}
              onClick={() => onAgeGroupChange(option.value)}
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </section>
    </div>
  );
}
