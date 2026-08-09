"use client";

import Image from "next/image";
import { useState } from "react";
import { getResult } from "@/data/results";
import type { DiagnosisType } from "@/types/diagnosis";

interface ResultIllustrationProps {
  type: DiagnosisType;
  variant?: "default" | "hero";
}

export function ResultIllustration({
  type,
  variant = "default",
}: ResultIllustrationProps) {
  const { flower, name, imagePath } = getResult(type);
  const [imgError, setImgError] = useState(false);

  const isHero = variant === "hero";

  return (
    <div className={`mx-auto w-full ${isHero ? "max-w-[280px]" : "max-w-[240px]"}`}>
      <div
        className={
          isHero
            ? "relative aspect-square overflow-hidden rounded-2xl shadow-lg ring-4 ring-white/20"
            : "relative aspect-square overflow-hidden rounded-2xl border border-dawn-border bg-dawn-surface"
        }
      >
        {!imgError && (
          <Image
            src={imagePath}
            alt={`${name}（${flower}）のイラスト`}
            fill
            className="object-cover"
            sizes={isHero ? "280px" : "240px"}
            onError={() => setImgError(true)}
          />
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-4xl" aria-hidden>
              🌸
            </p>
            <p
              className={`mt-2 text-lg font-semibold ${isHero ? "text-white" : "text-dawn-text"}`}
            >
              {flower}
            </p>
            <p className={`mt-1 text-xs ${isHero ? "text-white/80" : "text-dawn-muted"}`}>
              イラスト準備中
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
