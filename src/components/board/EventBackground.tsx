import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EventBackgroundProps = {
  children: ReactNode;
  className?: string;
};

export function EventBackground({ children, className }: EventBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-x-hidden bg-[#eceae6]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-16 size-64 rounded-full bg-[#e8d4c8]/80 blur-[2px] sm:size-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, #f0ddd0 0%, #e8d4c8 50%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-[32%] size-56 rounded-full bg-[#ebe4b8]/70 blur-[1px] sm:size-72"
        style={{
          backgroundImage:
            "radial-gradient(circle at 60% 40%, #f2ecc8 0%, #e8e0b0 45%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-40 left-[8%] size-44 rounded-full bg-[#e5ddd4]/60"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
