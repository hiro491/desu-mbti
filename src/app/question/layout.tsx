import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "質問",
  robots: { index: false },
};

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
