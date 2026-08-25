"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { DEATH_TECH_URL } from "@/lib/site";

const NAV_ITEMS = [
  {
    href: "/about",
    label: "デスタイプ診断とは",
    match: (path: string) => path.startsWith("/about"),
  },
  {
    href: "/types",
    label: "タイプ一覧",
    match: (path: string) => path.startsWith("/types"),
  },
  {
    href: "/",
    label: "診断をする",
    match: (path: string) =>
      path === "/" ||
      path.startsWith("/question") ||
      path.startsWith("/demographics") ||
      path.startsWith("/result"),
  },
] as const;

function NavLinks({
  pathname,
  onNavigate,
  className = "",
  linkClassName = "",
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <ul className={className}>
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`block transition-opacity ${linkClassName} ${
                active
                  ? "text-[#333333] opacity-100"
                  : "text-[#333333]/80 hover:text-[#333333] hover:opacity-100"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-dawn-border bg-white">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-2 sm:h-16 sm:px-4 lg:px-6">
        <a
          href={DEATH_TECH_URL}
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
          className="hidden items-center gap-5 md:flex lg:gap-8"
          aria-label="メインナビゲーション"
        >
          <NavLinks
            pathname={pathname}
            className="flex items-center gap-5 lg:gap-8"
            linkClassName="whitespace-nowrap text-sm font-normal leading-none tracking-normal"
          />
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#333333] transition hover:bg-dawn-surface md:hidden"
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-20 bg-black/20 sm:top-16 md:hidden"
            aria-label="メニューを閉じる"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id={menuId}
            className="absolute inset-x-0 top-full z-30 border-b border-dawn-border bg-white px-4 py-3 shadow-sm md:hidden"
            aria-label="モバイルメニュー"
          >
            <NavLinks
              pathname={pathname}
              onNavigate={() => setMenuOpen(false)}
              className="space-y-1"
              linkClassName="rounded-lg px-3 py-3 text-sm font-normal leading-none tracking-normal"
            />
          </nav>
        </>
      )}
    </header>
  );
}
