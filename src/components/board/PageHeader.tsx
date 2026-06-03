"use client";

import { useState } from "react";
import Image from "next/image";
import type { BoardPage } from "@/types/database";
import { formatEventDateRange } from "@/lib/format";
import {
  getAvatarUrl,
  getPageLabel,
  getPersonName,
} from "@/lib/page-display";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

type PageHeaderProps = {
  page: BoardPage;
};

export function PageHeader({ page }: PageHeaderProps) {
  const pageLabel = getPageLabel(page);
  const personName = getPersonName(page);
  const avatarUrl = getAvatarUrl(page);
  const dateRange = formatEventDateRange(
    page.start_date,
    page.end_date,
    page.start_time,
    page.end_time
  );
  const [descExpanded, setDescExpanded] = useState(false);
  const description = page.description?.trim() ?? "";
  const isLongDesc = description.length > 100;

  return (
    <header className="px-4 pb-4 pt-8 text-center sm:px-6 sm:pt-10">
      <p className="text-[13px] tracking-wide text-[#9a9590]">{pageLabel}</p>

      <div className="mx-auto mt-5 inline-block rounded-full bg-white px-10 py-2.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <h1 className="text-[17px] font-normal text-[#4a4a4a] sm:text-lg">
          {personName}
        </h1>
      </div>

      <div className="mx-auto mt-7 flex justify-center sm:mt-8">
        <div className="relative size-[148px] overflow-hidden rounded-full border-[5px] border-white bg-[#e0d6ce] shadow-[0_4px_16px_rgba(0,0,0,0.08)] sm:size-[160px]">
          <Image
            src={avatarUrl}
            alt={`${personName}さんの写真`}
            fill
            className="object-cover"
            priority
            unoptimized={avatarUrl.startsWith("/uploads/")}
          />
        </div>
      </div>

      {dateRange && (
        <div className="mt-7 sm:mt-8">
          <p className="text-[13px] text-[#9a9590]">開式日時</p>
          <div className="mx-auto mt-2 inline-block rounded-full bg-white px-7 py-2 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
            <p className="text-[13px] text-[#5a5a5a]">{dateRange}</p>
          </div>
        </div>
      )}

      {description && (
        <div className="mx-auto mt-7 max-w-[340px] sm:mt-8">
          <div className="rounded-[2rem] bg-white px-7 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)] sm:rounded-[2.25rem] sm:px-8 sm:py-8">
            <p
              className={cn(
                "whitespace-pre-wrap text-left text-[14px] leading-[1.9] text-[#4a4a4a]",
                !descExpanded && isLongDesc && "line-clamp-5"
              )}
            >
              {description}
            </p>
            {isLongDesc && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="flex size-8 items-center justify-center rounded-full border border-[#ebe7e1] bg-[#faf9f7] text-[#9a9590] shadow-sm"
                  aria-label={descExpanded ? "閉じる" : "続きを読む"}
                >
                  <ChevronDownIcon
                    className={cn(
                      "size-4 transition",
                      descExpanded && "rotate-180"
                    )}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
