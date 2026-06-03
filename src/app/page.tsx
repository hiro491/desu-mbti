import { CreatePageForm } from "@/components/home/CreatePageForm";
import { EventBackground } from "@/components/board/EventBackground";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function HomePage() {
  return (
    <EventBackground>
      <main className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[13px] tracking-wide text-[#9a9590]">
            デジタルメッセージボード
          </p>
          <h1 className="mt-2 font-serif text-[2rem] font-normal tracking-wide text-[#5a5a5a] sm:text-4xl">
            {SITE_NAME}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[#9a9590]">
            {SITE_DESCRIPTION}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <CreatePageForm />
        </div>
      </main>
    </EventBackground>
  );
}
