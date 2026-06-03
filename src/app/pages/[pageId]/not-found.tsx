import Link from "next/link";
import { EventBackground } from "@/components/board/EventBackground";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/site";

export default function PageNotFound() {
  return (
    <EventBackground>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="font-serif text-2xl text-[#5c5c5c]">
          ページが見つかりません
        </h1>
        <p className="mt-3 text-[#8a8580]">URLが正しいかご確認ください。</p>
        <Button
          render={<Link href="/" />}
          className="mt-8 rounded-full bg-[#5c5c5c] font-medium text-white hover:bg-[#4a4a4a]"
          size="lg"
        >
          {SITE_NAME} トップへ
        </Button>
      </main>
    </EventBackground>
  );
}
