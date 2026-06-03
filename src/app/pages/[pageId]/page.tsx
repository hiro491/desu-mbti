import { notFound } from "next/navigation";
import { getPageData } from "@/lib/board";
import { PageBoard } from "@/components/board/PageBoard";

type PublicPageProps = {
  params: Promise<{ pageId: string }>;
};

export default async function PublicPage({ params }: PublicPageProps) {
  const { pageId } = await params;
  const data = await getPageData(pageId);

  if (!data) {
    notFound();
  }

  return (
    <PageBoard
      page={data.page}
      messages={data.messages}
      photos={data.photos}
    />
  );
}
