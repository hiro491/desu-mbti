import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { QUESTION_COUNT } from "@/data/questions";
import { getTotalPages } from "@/lib/question-pages";

export default function HomePage() {
  return (
    <PageShell>
      <section className="rounded-2xl border border-dawn-border bg-dawn-card p-6 shadow-sm sm:p-8">
        <p className="text-sm leading-relaxed text-dawn-text">
          デスタイプ診断は、死への情緒・死後の世界観・他者との距離・終末期のスタンスという4つの軸から、あなたの「今のタイプ」を16種類でやさしく映し出します。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-dawn-text">
          全{QUESTION_COUNT}問を{getTotalPages()}ページに分けて回答します（7段階）。結果は花のタイプでお伝えします。
        </p>
        <p className="mt-4 text-sm leading-relaxed text-dawn-muted">
          正解はありません。いまの気持ちに近いほうを選んでください。
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/question"
            className="btn-gray inline-flex w-full max-w-xs items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold shadow-sm"
          >
            診断をスタートする
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
