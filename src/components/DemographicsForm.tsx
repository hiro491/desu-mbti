"use client";

import type { ReactNode, RefObject } from "react";
import { useCallback } from "react";
import {
  AGE_GROUP_OPTIONS,
  BEREAVEMENT_OPTIONS,
  GENDER_OPTIONS,
  getNextIncompleteDemographicSectionIndex,
  isDemographicSectionComplete,
  MARITAL_STATUS_OPTIONS,
  OCCUPATION_OPTIONS,
  RESIDENCE_OPTIONS,
  type DemographicsFormState,
  type Occupation,
} from "@/data/demographics";

interface ChoiceButtonProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

function ChoiceButton({
  selected,
  onClick,
  children,
  className = "",
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        selected
          ? `btn-gray w-full rounded-full border-2 border-sumi px-3 py-2.5 text-sm font-bold ${className}`
          : `w-full rounded-full border-2 border-dawn-border bg-white px-3 py-2.5 text-sm font-medium text-dawn-text transition hover:border-sumi ${className}`
      }
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-sm font-bold leading-relaxed text-dawn-text">
      {children}
      <span className="ml-1 text-azuki" aria-hidden>
        *
      </span>
    </p>
  );
}

function SectionDivider() {
  return <div className="border-t border-dawn-border" />;
}

interface DemographicsFormProps {
  value: DemographicsFormState;
  onChange: (value: DemographicsFormState) => void;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function DemographicsForm({
  value,
  onChange,
  scrollContainerRef,
}: DemographicsFormProps) {
  const scrollToSection = useCallback(
    (sectionIndex: number) => {
      const container = scrollContainerRef?.current;
      const target = document.getElementById(`demographic-${sectionIndex}`);
      if (!container || !target) return;

      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const offset = targetTop - containerTop + container.scrollTop - 24;

      container.scrollTo({ top: offset, behavior: "smooth" });
    },
    [scrollContainerRef],
  );

  const applyUpdate = useCallback(
    (nextValue: DemographicsFormState, sectionIndex: number) => {
      const wasComplete = isDemographicSectionComplete(value, sectionIndex);
      onChange(nextValue);

      const isComplete = isDemographicSectionComplete(nextValue, sectionIndex);
      if (!wasComplete && isComplete) {
        const nextSection = getNextIncompleteDemographicSectionIndex(
          nextValue,
          sectionIndex,
        );
        if (nextSection !== undefined) {
          window.setTimeout(() => scrollToSection(nextSection), 200);
        }
      }
    },
    [onChange, scrollToSection, value],
  );

  const update = <K extends keyof DemographicsFormState>(
    key: K,
    nextValue: DemographicsFormState[K],
    sectionIndex: number,
  ) => {
    applyUpdate({ ...value, [key]: nextValue }, sectionIndex);
  };

  const handleOccupationChange = (occupation: Occupation) => {
    applyUpdate(
      {
        ...value,
        occupation,
        occupationOther: occupation === "other" ? value.occupationOther : "",
      },
      3,
    );
  };

  return (
    <div className="space-y-8">
      <section id="demographic-0">
        <SectionTitle>1）あなたの年代を教えてください。</SectionTitle>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {AGE_GROUP_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={value.ageGroup === option.value}
              onClick={() => update("ageGroup", option.value, 0)}
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </section>

      <SectionDivider />

      <section id="demographic-1">
        <SectionTitle>2）性別を教えてください。</SectionTitle>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {GENDER_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={value.gender === option.value}
              onClick={() => update("gender", option.value, 1)}
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </section>

      <SectionDivider />

      <section id="demographic-2">
        <SectionTitle>3）居住地を教えてください。</SectionTitle>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          {RESIDENCE_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={value.residence === option.value}
              onClick={() => update("residence", option.value, 2)}
              className="text-left sm:text-center"
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </section>

      <SectionDivider />

      <section id="demographic-3">
        <SectionTitle>4）職業を教えてください。</SectionTitle>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          {OCCUPATION_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={value.occupation === option.value}
              onClick={() => handleOccupationChange(option.value)}
              className="text-left sm:text-center"
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
        {value.occupation === "other" && (
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-bold text-dawn-muted">
              その他（具体的に入力してください）
              <span className="ml-1 text-azuki" aria-hidden>
                *
              </span>
            </span>
            <input
              type="text"
              value={value.occupationOther}
              onChange={(event) => {
                applyUpdate(
                  { ...value, occupationOther: event.target.value },
                  3,
                );
              }}
              placeholder="職業を入力"
              className="w-full rounded-xl border-2 border-dawn-border px-4 py-3 text-sm text-dawn-text outline-none transition focus:border-sumi"
            />
          </label>
        )}
      </section>

      <SectionDivider />

      <section id="demographic-4">
        <SectionTitle>5）婚姻状況を教えてください。</SectionTitle>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {MARITAL_STATUS_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={value.maritalStatus === option.value}
              onClick={() => update("maritalStatus", option.value, 4)}
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </section>

      <SectionDivider />

      <section id="demographic-5">
        <SectionTitle>
          6）これまでに、ご家族や親しい方との死別を経験されたことはありますか？
        </SectionTitle>
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {BEREAVEMENT_OPTIONS.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={value.bereavementExperience === option.value}
              onClick={() => update("bereavementExperience", option.value, 5)}
              className="text-left sm:text-center"
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
      </section>
    </div>
  );
}
