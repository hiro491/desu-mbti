"use client";

import type { TypeResult } from "@/data/results/types";
import { HighlightText, SectionTitle } from "@/components/ResultText";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-dawn-border bg-white p-4 sm:p-5">
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-4 text-sm leading-7 text-dawn-text">{children}</div>
    </section>
  );
}

export function ResultDetailSections({ result }: { result: TypeResult }) {
  return (
    <div id="result-detail" className="mt-6 space-y-4 scroll-mt-6">
      <Section title="表の顔">
        <p>
          <HighlightText text={result.publicFace} />
        </p>
      </Section>

      <Section title="裏の顔">
        <p>
          <HighlightText text={result.privateFace} />
        </p>
      </Section>

      <Section title="家族と対話するためのヒント">
        <p>
          <HighlightText text={result.familyDialogueHint} />
        </p>
      </Section>

      <Section title="向いている終活">
        <ul className="list-disc space-y-3 pl-5">
          {result.endOfLifeSteps.map((step, index) => (
            <li key={index} className="leading-7">
              <HighlightText text={step.text} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="死生観の構成">
        <ul className="space-y-4">
          {result.worldview.map((item) => (
            <li key={item.label} className="border-b border-dawn-border/60 pb-4 last:border-b-0 last:pb-0">
              <p className="font-bold underline decoration-gray-400 decoration-2 underline-offset-4">
                {item.label}
              </p>
              <p className="mt-2">
                <HighlightText text={item.text} />
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
