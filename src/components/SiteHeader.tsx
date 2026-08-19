"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ASSOCIATION_URL = "https://preview.studio.site/live/moWvKolzO6";

const NAV_ITEMS = [
  { href: "/about", label: "デスタイプ診断とは", match: (path: string) => path.startsWith("/about") },
  { href: "/types", label: "タイプ一覧", match: (path: string) => path.startsWith("/types") },
  {
    href: "/",
    label: "デスタイプ診断",
    match: (path: string) =>
      path === "/" ||
      path.startsWith("/question") ||
      path.startsWith("/demographics") ||
      path.startsWith("/result"),
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-dawn-border bg-white">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-2 sm:h-16 sm:px-4 lg:px-6">
        <a
          href={ASSOCIATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
          aria-label="DEATH TECH（外部サイト）"
        >
          <Image
            src="/death-tech-logo-horizontal.png"
            alt="DEATH TECH"
            width={516}
            height={178}
            className="h-7 w-auto sm:h-8"
            priority
          />
        </a>

        <nav
          className="flex items-center gap-3 sm:gap-5 lg:gap-8"
          aria-label="メインナビゲーション"
        >
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap text-[12px] font-normal leading-none tracking-normal transition-opacity sm:text-sm ${
                  active
                    ? "text-[#333333] opacity-100"
                    : "text-[#333333]/80 hover:text-[#333333] hover:opacity-100"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
