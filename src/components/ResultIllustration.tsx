"use client";

import Image from "next/image";
import { useState } from "react";
import { getResult } from "@/data/results";
import type { DiagnosisType } from "@/types/diagnosis";

interface ResultIllustrationProps {
  type: DiagnosisType;
}

export function ResultIllustration({ type }: ResultIllustrationProps) {
  const { animal, name, imagePath } = getResult(type);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[240px]">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-dawn-border bg-dawn-accent-soft/30">
        {!imgError && (
          <Image
            src={imagePath}
            alt={`${name}（${animal}）のキャラクターイラスト`}
            fill
            className="object-cover"
            sizes="240px"
            onError={() => setImgError(true)}
          />
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <p className="text-4xl" aria-hidden>
              🐾
            </p>
            <p className="mt-2 text-lg font-semibold text-dawn-accent">
              {animal}
            </p>
            <p className="mt-1 text-xs text-dawn-muted">イラスト準備中</p>
          </div>
        )}
      </div>
    </div>
  );
}
