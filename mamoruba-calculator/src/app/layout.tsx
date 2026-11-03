import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";
import "./calculator.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: {
    absolute: "マモルバ料金計算",
  },
  description:
    "稼働時間・往復交通費・保険料などを入力して、マモルバの料金目安を計算できるツールです。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "マモルバ料金計算",
    description:
      "稼働時間・往復交通費・保険料などを入力して、マモルバの料金目安を計算できます。",
    url: siteUrl,
    locale: "ja_JP",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="mamoruba-calculator min-h-dvh antialiased">{children}</body>
    </html>
  );
}
