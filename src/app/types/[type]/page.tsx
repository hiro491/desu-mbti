import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { TypeDetailContent } from "@/components/TypeDetailContent";
import { getResult } from "@/data/results";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import {
  DIAGNOSIS_TYPES,
  formatTypeDisplay,
  isDiagnosisType,
  type DiagnosisType,
} from "@/types/diagnosis";

interface TypeDetailPageProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return DIAGNOSIS_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: TypeDetailPageProps): Promise<Metadata> {
  const { type } = await params;
  if (!isDiagnosisType(type)) {
    return { title: "タイプが見つかりません" };
  }

  const result = getResult(type);
  const display = formatTypeDisplay(type);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/types/${type}`;
  const ogTitle = `${result.name}（${display}）| ${SITE_NAME}`;
  const ogDescription = `${result.catchphrase} — ${result.basicInfo}`;

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

export default async function TypeDetailPage({ params }: TypeDetailPageProps) {
  const { type } = await params;

  if (!isDiagnosisType(type)) {
    notFound();
  }

  return (
    <PageShell layout="result" showDisclaimer={false}>
      <TypeDetailContent type={type as DiagnosisType} />
    </PageShell>
  );
}
