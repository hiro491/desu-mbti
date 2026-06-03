"use client";

import { ImageIcon, MessageSquareIcon, UserPlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BoardView = "messages" | "photos";

type FloatingNavProps = {
  view: BoardView;
  onViewChange: (view: BoardView) => void;
  onInvite: () => void;
  inviteLabel?: string;
};

export function FloatingNav({
  view,
  onViewChange,
  onInvite,
  inviteLabel = "招待",
}: FloatingNavProps) {
  const items: {
    id: BoardView | "invite";
    label: string;
    icon: typeof ImageIcon;
    action: () => void;
  }[] = [
    {
      id: "photos",
      label: "写真",
      icon: ImageIcon,
      action: () => onViewChange("photos"),
    },
    {
      id: "messages",
      label: "メッセージ",
      icon: MessageSquareIcon,
      action: () => onViewChange("messages"),
    },
    {
      id: "invite",
      label: inviteLabel,
      icon: UserPlusIcon,
      action: onInvite,
    },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 sm:bottom-6">
      <div className="flex items-center gap-0.5 rounded-full bg-[#3f3f3f]/90 px-5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-[2px] sm:gap-1 sm:px-7 sm:py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id !== "invite" && view === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={cn(
                "flex min-w-[4.25rem] flex-col items-center gap-0.5 rounded-full px-3 py-1 text-white transition sm:min-w-[4.75rem]",
                active && "bg-white/12"
              )}
            >
              <Icon className="size-[22px]" strokeWidth={1.5} />
              <span className="text-[10px] font-normal tracking-wide sm:text-[11px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
