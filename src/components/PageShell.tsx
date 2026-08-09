import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  showDisclaimer?: boolean;
  layout?: "center" | "scroll" | "result" | "wide";
}

export function PageShell({
  children,
  showDisclaimer = true,
  layout = "center",
}: PageShellProps) {
  const mainClass =
    layout === "result"
      ? "relative z-10 mx-auto flex w-full max-w-xl flex-col px-0 pb-6 pt-4"
      : layout === "wide"
        ? "relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10"
        : layout === "scroll"
          ? "relative z-10 mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-xl flex-col overflow-x-hidden overflow-y-hidden px-4 py-6 sm:h-[calc(100dvh-4rem)] sm:px-6"
          : "relative z-10 mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-xl flex-col justify-center px-4 py-10 sm:min-h-[calc(100dvh-4rem)] sm:px-6";

  const pageBg = layout === "result" ? "bg-dawn-surface" : "bg-white";

  return (
    <div className={`relative min-h-[calc(100dvh-3.5rem)] text-dawn-text sm:min-h-[calc(100dvh-4rem)] ${pageBg}`}>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <main className={mainClass}>
        {children}
        {showDisclaimer && layout !== "result" && (
          <p className="mt-8 shrink-0 text-center text-[0.7rem] leading-relaxed text-dawn-muted/90">
            本診断は自己理解のためのコンテンツです。深刻な不安がある場合は、信頼できる医療・相談窓口をご利用ください。
          </p>
        )}
      </main>
    </div>
  );
}
