import type { Message } from "@/types/database";
import { ExpandableText } from "@/components/board/ExpandableText";

type MessageCardProps = {
  message: Message;
};

export function MessageCard({ message }: MessageCardProps) {
  return (
    <article className="rounded-[2rem] bg-white px-7 py-7 shadow-[0_2px_12px_rgba(0,0,0,0.05)] sm:rounded-[2.25rem] sm:px-8 sm:py-8">
      <ExpandableText text={message.content} />
    </article>
  );
}
