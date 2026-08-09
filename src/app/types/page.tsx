import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getResult } from "@/data/results";
import { getTypeShortName, TYPE_GROUPS } from "@/data/type-groups";
import { SITE_NAME } from "@/lib/site";
import { formatTypeDisplay } from "@/types/diagnosis";

export const metadata: Metadata = {
  title: "タイプ一覧",
  description: "16種類のデスタイプ（花タイプ）の一覧。各タイプの詳細を確認できます。",
  openGraph: {
    title: `タイプ一覧 | ${SITE_NAME}`,
  },
};

function TypesList() {
  return (
    <div className="space-y-10">
      {TYPE_GROUPS.map((group) => (
        <section key={group.id} className="py-2">
          <h2
            className="text-xl font-bold sm:text-2xl"
            style={{ color: group.accentColor }}
          >
            {group.title}
          </h2>
          <p className="mt-1 text-sm font-bold text-dawn-text">{group.subtitle}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-dawn-muted">
            {group.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {group.types.map((type) => {
                const result = getResult(type);
                const shortName = getTypeShortName(result.name);

                return (
                  <Link
                    key={type}
                    href={`/types/${type}`}
                    className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-dawn-surface">
                      <Image
                        src={result.imagePath}
                        alt={result.name}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <p className="text-sm font-bold text-dawn-text sm:text-base">{shortName}</p>
                      <p className="mt-1 text-xs font-bold tracking-wider text-dawn-muted">
                        {formatTypeDisplay(type)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-dawn-muted">
                        {result.catchphrase}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
        </section>
      ))}
    </div>
  );
}

export default function TypesPage() {
  return (
    <PageShell layout="wide" showDisclaimer={false}>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-sumi sm:text-3xl">16のデスタイプ</h1>
        <p className="mt-3 text-sm leading-relaxed text-dawn-muted sm:text-base">
          死への情緒・死後の世界観・他者との距離・終末期のスタンスの4軸から分類される、16種類の花タイプ一覧です。
        </p>
      </div>

      <TypesList />
    </PageShell>
  );
}
