"use client";

import type { MemberCompany } from "@/data/member-companies";
import type { TypeResult } from "@/data/results/types";
import { HighlightText } from "@/components/ResultText";
import { MemberCompanyList } from "@/components/MemberCompanyList";
import { ResultSectionHeader } from "@/components/ResultSectionHeader";

function ResultCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

interface ResultDetailSectionsProps {
  result: TypeResult;
  startNumber?: number;
  memberCompanies?: MemberCompany[];
}

export function ResultDetailSections({
  result,
  startNumber = 3,
  memberCompanies = [],
}: ResultDetailSectionsProps) {
  const sections = [
    {
      title: "表の顔",
      content: <HighlightText text={result.publicFace} />,
    },
    {
      title: "裏の顔",
      content: <HighlightText text={result.privateFace} />,
    },
    {
      title: "家族と対話するためのヒント",
      content: <HighlightText text={result.familyDialogueHint} />,
    },
    {
      title: "向いている終活",
      content: (
        <>
          <ul className="list-disc space-y-3 pl-5">
            {result.endOfLifeSteps.map((step, index) => (
              <li key={index} className="leading-7 text-dawn-text">
                <HighlightText text={step.text} />
              </li>
            ))}
          </ul>
          <MemberCompanyList companies={memberCompanies} />
        </>
      ),
    },
    {
      title: "死生観の構成",
      content: (
        <ul className="space-y-5">
          {result.worldview.map((item) => (
            <li key={item.label}>
              <p className="font-bold text-azuki">{item.label}</p>
              <p className="mt-2 leading-7 text-dawn-text">
                <HighlightText text={item.text} />
              </p>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div id="result-detail" className="space-y-10 scroll-mt-6">
      {sections.map((section, index) => (
        <section key={section.title}>
          <ResultSectionHeader
            number={startNumber + index}
            title={section.title}
          />
          <ResultCard>
            <div className="text-sm leading-7 text-dawn-text sm:text-base">
              {section.content}
            </div>
          </ResultCard>
        </section>
      ))}
    </div>
  );
}
