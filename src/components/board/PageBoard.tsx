"use client";

import { useState } from "react";
import Image from "next/image";
import type { BoardPage, Message, Photo } from "@/types/database";
import { getPublicPageUrl } from "@/lib/site";
import { getPersonName } from "@/lib/page-display";
import { EventBackground } from "@/components/board/EventBackground";
import { PageHeader } from "@/components/board/PageHeader";
import { MessageCard } from "@/components/board/MessageCard";
import { AddMessageDialog } from "@/components/board/AddMessageDialog";
import { AddPhotoDialog } from "@/components/board/AddPhotoDialog";
import { SectionHeading } from "@/components/board/SectionHeading";
import { FloatingNav, type BoardView } from "@/components/board/FloatingNav";

type PageBoardProps = {
  page: BoardPage;
  messages: Message[];
  photos: Photo[];
};

export function PageBoard({ page, messages, photos }: PageBoardProps) {
  const [view, setView] = useState<BoardView>("messages");
  const [inviteLabel, setInviteLabel] = useState("招待");
  const personName = getPersonName(page);

  async function handleInvite() {
    const url = getPublicPageUrl(page.id);
    try {
      await navigator.clipboard.writeText(url);
      setInviteLabel("コピーしました");
      setTimeout(() => setInviteLabel("招待"), 2000);
    } catch {
      window.prompt("このURLを共有してください", url);
    }
  }

  return (
    <EventBackground>
      <PageHeader page={page} />

      <div className="mx-auto max-w-[400px] px-4 pb-32 pt-2 sm:px-5">
        <div className="grid grid-cols-2 gap-3">
          <AddMessageDialog pageId={page.id} />
          <AddPhotoDialog pageId={page.id} />
        </div>

        {view === "messages" && (
          <section className="mt-10">
            <SectionHeading
              subtitle={`${personName}へのメッセージ`}
              title="Message"
            />
            {messages.length === 0 ? (
              <p className="rounded-[2rem] bg-white/90 px-6 py-10 text-center text-[14px] leading-relaxed text-[#9a9590]">
                まだメッセージがありません。
              </p>
            ) : (
              <ul className="space-y-4">
                {messages.map((message) => (
                  <li key={message.id}>
                    <MessageCard message={message} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {view === "photos" && (
          <section className="mt-10">
            <SectionHeading
              subtitle={`${personName}の写真`}
              title="Album"
            />
            {photos.length === 0 ? (
              <p className="rounded-[2rem] bg-white/90 px-6 py-10 text-center text-[14px] leading-relaxed text-[#9a9590]">
                まだ写真がありません。
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-2.5">
                {photos.map((photo) => (
                  <li
                    key={photo.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                  >
                    <div className="relative aspect-square w-full bg-[#ebe6e0]">
                      <Image
                        src={photo.image_url}
                        alt={`${photo.sender_name}さんの写真`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 400px) 50vw, 180px"
                        unoptimized={photo.image_url.startsWith("/uploads/")}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      <FloatingNav
        view={view}
        onViewChange={setView}
        onInvite={handleInvite}
        inviteLabel={inviteLabel}
      />
    </EventBackground>
  );
}
