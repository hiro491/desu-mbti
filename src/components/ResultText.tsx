"use client";

import type { ReactNode } from "react";

/** 「」で囲まれた語句を太字にする */
export function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(「[^」]+」)/g);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("「") && part.endsWith("」") ? (
          <strong key={index} className="font-bold text-dawn-navy-deep">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b-2 border-gray-400 pb-2 text-base font-bold tracking-wide text-dawn-text">
      {children}
    </h3>
  );
}
