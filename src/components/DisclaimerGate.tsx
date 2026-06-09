"use client";

import { ETHICAL_DISCLAIMERS } from "@/data/disclaimers";

interface DisclaimerGateProps {
  onAccept: () => void;
}

export function DisclaimerGate({ onAccept }: DisclaimerGateProps) {
  return (
    <section className="rounded-2xl border border-dawn-border bg-dawn-card p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-dawn-text">
        診断を始める前に
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dawn-text">
        デリケートなテーマを扱いますので、以下の4点をご理解のうえ進めてください。
      </p>
      <ol className="mt-5 space-y-4">
        {ETHICAL_DISCLAIMERS.map((item, i) => (
          <li key={item.title} className="text-sm">
            <span className="font-bold text-dawn-navy-deep">
              {i + 1}. {item.title}
            </span>
            <p className="mt-1 leading-relaxed text-dawn-muted">{item.body}</p>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onAccept}
        className="mt-8 w-full rounded-xl bg-dawn-accent py-3.5 text-sm font-bold text-white transition hover:bg-dawn-accent-light active:scale-[0.98]"
      >
        内容を理解したうえで診断を始める
      </button>
    </section>
  );
}
