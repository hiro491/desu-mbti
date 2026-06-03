import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { QUESTION_COUNT } from "@/data/questions";

export default function HomePage() {
  return (
    <PageShell>
      <section className="rounded-2xl border border-dawn-border bg-dawn-card p-6 shadow-sm sm:p-8">
        <p className="text-sm leading-relaxed text-dawn-muted">
          デスMBTI（死生観MBTI）は、死への情緒・死後の世界観・他者との距離・終末期のスタンスという4つの軸から、あなたの「今の死生観」を16タイプでやさしく映し出す診断です。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-dawn-muted">
          全{QUESTION_COUNT}問・1〜5のボタンで回答します。結果はパーセンテージのグラデーションと、動物キャラクターでお伝えします。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-dawn-muted">
          正解はありません。いまの気持ちに近いほうを選んでください。
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/question"
            className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-dawn-accent px-6 py-3.5 text-sm font-bold text-dawn-navy-deep shadow-sm transition hover:bg-dawn-accent-light active:scale-[0.98]"
          >
            診断をスタートする
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
