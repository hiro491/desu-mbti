"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  text: string;
  className?: string;
};

export function ExpandableText({ text, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 160 || text.split("\n").length > 6;

  return (
    <div className={cn("relative", className)}>
      <p
        className={cn(
          "whitespace-pre-wrap text-left text-[14px] leading-[1.9] text-[#4a4a4a]",
          !expanded && isLong && "line-clamp-6"
        )}
      >
        {text}
      </p>
      {isLong && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex size-8 items-center justify-center rounded-full border border-[#ebe7e1] bg-[#faf9f7] text-[#9a9590] shadow-sm"
            aria-label={expanded ? "閉じる" : "続きを読む"}
          >
            <ChevronDownIcon
              className={cn("size-4 transition", expanded && "rotate-180")}
            />
          </button>
        </div>
      )}
    </div>
  );
}
