import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AddActionButtonProps = {
  label: string;
  className?: string;
  children?: ReactNode;
};

export function AddActionButton({
  label,
  className,
  children,
}: AddActionButtonProps) {
  return (
    <div
      className={cn(
        "flex min-h-[88px] w-full flex-col items-center justify-center rounded-[1.5rem] bg-white px-4 py-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition hover:bg-[#fcfbfa] active:scale-[0.99]",
        className
      )}
    >
      {children ?? (
        <>
          <span className="text-[15px] font-normal text-[#4a4a4a]">{label}</span>
          <span className="mt-1.5 text-[13px] text-[#9a9590]">追加する</span>
        </>
      )}
    </div>
  );
}
