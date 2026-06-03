import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { getResult } from "@/data/results";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import {
  DIAGNOSIS_TYPES,
  formatTypeDisplay,
  isDiagnosisType,
  type DiagnosisType,
} from "@/types/diagnosis";
import { ResultContent } from "./ResultContent";

interface ResultPageProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return DIAGNOSIS_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { type } = await params;
  if (!isDiagnosisType(type)) {
    return { title: "結果が見つかりません" };
  }

  const result = getResult(type);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/result/${type}`;
  const display = formatTypeDisplay(type);
  const ogTitle = `${result.name}（${display}）| ${SITE_NAME}`;
  const ogDescription = `${result.catchphrase} — ${result.suitableEndOfLife}`;

  return {
    title: `${result.name}（${display}）`,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: pageUrl,
      type: "article",
      locale: "ja_JP",
      siteName: SITE_NAME,
      images: [{ url: result.imagePath, alt: result.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [result.imagePath],
    },
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { type } = await params;

  if (!isDiagnosisType(type)) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/result/${type}`;

  return (
    <PageShell>
      <ResultContent type={type as DiagnosisType} shareUrl={pageUrl} />
    </PageShell>
  );
}
