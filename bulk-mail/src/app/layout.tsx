import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "一斉メール",
  description: "Excelの宛先一覧に、文面と添付ファイルをカスタマイズしてメールを送ります。",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
