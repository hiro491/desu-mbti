import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { TYPE_GROUPS } from "@/data/type-groups";
import { QUESTION_COUNT } from "@/data/questions";
import { getTotalPages } from "@/lib/question-pages";
import { SITE_NAME } from "@/lib/site";
import { DIMENSION_META } from "@/types/diagnosis";

export const metadata: Metadata = {
  title: "デスタイプ診断とは？",
  description:
    "死への情緒・死後の世界観・他者との距離・終末期のスタンスの4軸から、16種類の花タイプであなたの死生観を映し出すデスタイプ診断の概要です。",
  openGraph: {
    title: `デスタイプ診断とは？ | ${SITE_NAME}`,
  },
};

const FAQ = [
  {
    q: "16タイプは固定されますか？",
    a: "タイプは「いまのあなた」を映すものです。人生の節目や経験によって、結果が変わることもあります。定期的に受けてみるのもおすすめです。",
  },
  {
    q: "正解や不正解はありますか？",
    a: "ありません。正しい死生観はひとつではないからです。いまの気持ちに近い選択肢を選んでください。",
  },
  {
    q: "診断結果は医療・法律の助言ですか？",
    a: "いいえ。本診断は自己理解のためのコンテンツです。具体的な医療・法律・相続の判断は、専門家にご相談ください。",
  },
  {
    q: "所要時間はどのくらいですか？",
    a: `全${QUESTION_COUNT}問を${getTotalPages()}ステップに分けて回答します。おおよそ5〜10分程度です。`,
  },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-sumi sm:text-xl">{children}</h2>
  );
}

export default function AboutPage() {
  const dimensionKeys = ["FA", "SN", "IC", "TN"] as const;

  return (
    <PageShell layout="wide" showDisclaimer={false}>
      <article className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest text-odo">ABOUT</p>
          <h1 className="mt-3 text-2xl font-bold text-sumi sm:text-3xl">
            デスタイプ診断とは？
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-dawn-muted sm:text-base">
            16タイプの花で、いまのあなたの死生観を映し出す。
            <br className="hidden sm:inline" />
            終活や死生観は、ひとことでは言い切れない——だからこそ、4つの軸で立体的に見つめます。
          </p>
        </header>

        <section className="mb-12 space-y-4">
          <SectionTitle>デスタイプ診断、誕生。</SectionTitle>
          <p className="text-sm leading-7 text-dawn-text sm:text-base">
            デスタイプ診断は、死や終末期、死生観について考えるときに生じる
            「不安」「希望」「絆」「準備のしかた」といった複雑な気持ちを、
            4つの心理軸から整理し、16種類の花タイプとして可視化する自己理解ツールです。
          </p>
          <p className="text-sm leading-7 text-dawn-text sm:text-base">
            読むだけで終わらない。結果は花のキャラクターとして届くから、
            「自分はどんな死生観を持っているのか」が、直感的に腹落ちしやすくなります。
          </p>
        </section>

        <section className="mb-12 space-y-4">
          <SectionTitle>なぜ、デスタイプ診断が必要なのか。</SectionTitle>
          <p className="text-sm leading-7 text-dawn-text sm:text-base">
            終活や死生観について考え始めると、こんな迷いが生まれやすいものです。
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-dawn-muted sm:text-base">
            <li>お墓や供養——形式と自分の気持ち、どちらを優先すればいい？</li>
            <li>家族に迷惑をかけたくない。でも、話題にするのは怖い。</li>
            <li>準備はしたい。でも、考えるだけで心が重くなる。</li>
            <li>正しい答えがあるのか、わからない。</li>
          </ul>
          <p className="text-sm leading-7 text-dawn-text sm:text-base">
            デスタイプ診断は、正解を押し付けるものではありません。
            いまのあなたの「傾向」を言葉と花で映し出し、
            自分らしい終活や対話のきっかけをつくることを目的としています。
          </p>
        </section>

        <section className="mb-12">
          <SectionTitle>4つの軸で、死生観を立体的に読み解く。</SectionTitle>
          <p className="mt-4 text-sm leading-7 text-dawn-muted sm:text-base">
            デスタイプ診断は、次の4つの心理軸からあなたのタイプを導き出します。
          </p>
          <div className="mt-6 space-y-4">
            {dimensionKeys.map((key) => {
              const meta = DIMENSION_META[key];
              return (
                <div
                  key={key}
                  className="rounded-xl border border-dawn-border bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-bold text-sumi">
                    {key === "FA" && "感情軸"}
                    {key === "SN" && "認知軸"}
                    {key === "IC" && "関係軸"}
                    {key === "TN" && "行動軸"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-dawn-text">
                    <span className="font-bold text-azuki">{meta.left}</span>
                    <span className="mx-2 text-dawn-muted">↔</span>
                    <span className="font-bold text-odo">{meta.right}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <SectionTitle>16タイプは、4つのグループに分かれます。</SectionTitle>
          <p className="mt-4 text-sm leading-7 text-dawn-muted sm:text-base">
            感情軸と認知軸の組み合わせから、4つの大きな系統が生まれます。
            それぞれの系統のなかに4つの花タイプが存在し、合計16タイプとなります。
          </p>
          <div className="mt-6 space-y-6">
            {TYPE_GROUPS.map((group) => (
              <div key={group.id}>
                <h3
                  className="text-base font-bold sm:text-lg"
                  style={{ color: group.accentColor }}
                >
                  {group.title}
                  <span className="ml-2 text-sm font-normal text-dawn-muted">
                    {group.subtitle}
                  </span>
                </h3>
                <p className="mt-2 text-sm leading-7 text-dawn-text">
                  {group.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <SectionTitle>花が、あなたのタイプを語る。</SectionTitle>
          <p className="mt-4 text-sm leading-7 text-dawn-text sm:text-base">
            診断結果は16種類の花として届きます。花言葉やキャッチコピー、
            表の顔・裏の顔、向いている終活、死生観の構成——
            タイプごとに丁寧に設計されたテキストで、あなたの「いま」を映し出します。
          </p>
          <p className="mt-4 text-sm leading-7 text-dawn-muted sm:text-base">
            結果はSNSでシェアすることもできます。大切な人と一緒に見ながら、
            終活や死生観について、自然な対話を始めるきっかけにしてください。
          </p>
        </section>

        <section className="mb-12">
          <SectionTitle>よくある質問</SectionTitle>
          <dl className="mt-6 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-sm font-bold text-dawn-text">Q. {item.q}</dt>
                <dd className="mt-2 text-sm leading-7 text-dawn-muted">
                  A. {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-dawn-border bg-dawn-surface px-6 py-8 text-center sm:px-10">
          <p className="text-sm font-bold text-sumi sm:text-base">
            あなたの花タイプを、見つけにいきましょう。
          </p>
          <p className="mt-2 text-xs text-dawn-muted sm:text-sm">
            全{QUESTION_COUNT}問・{getTotalPages()}ステップ・約5〜10分
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/question"
              className="btn-gray inline-flex w-full max-w-xs items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold sm:w-auto"
            >
              診断をスタートする
            </Link>
            <Link
              href="/types"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-xl border-2 border-sumi px-6 py-3.5 text-sm font-bold text-sumi transition hover:bg-white sm:w-auto"
            >
              16タイプ一覧を見る
            </Link>
          </div>
        </section>
      </article>
    </PageShell>
  );
}
