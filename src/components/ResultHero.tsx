"use client";

import { ResultIllustration } from "@/components/ResultIllustration";
import type { DiagnosisType } from "@/types/diagnosis";

interface ResultHeroProps {
  type: DiagnosisType;
  name: string;
  typeDisplay: string;
}

export function ResultHero({ type, name, typeDisplay }: ResultHeroProps) {
  return (
    <div className="relative bg-sumi px-5 pb-20 pt-8 text-center text-white sm:px-8 sm:pb-24 sm:pt-10">
      <p className="text-sm font-medium text-white/90">あなたのデスタイプ:</p>
      <h2 className="mt-2 text-2xl font-bold leading-snug sm:text-4xl">{name}</h2>
      <p className="mt-3 text-base font-bold tracking-[0.2em] text-odo-light sm:text-lg">
        {typeDisplay}
      </p>
      <div className="mx-auto mt-6 max-w-[280px] sm:max-w-xs">
        <ResultIllustration type={type} variant="hero" />
      </div>

      <svg
        className="absolute bottom-0 left-0 h-10 w-full sm:h-12"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="#eeedf1"
          d="M0,28 C240,44 480,12 720,28 C960,44 1200,16 1440,28 L1440,48 L0,48 Z"
        />
      </svg>
    </div>
  );
}
