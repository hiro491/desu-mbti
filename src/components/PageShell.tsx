import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  showDisclaimer?: boolean;
  layout?: "center" | "scroll";
}

export function PageShell({
  children,
  showDisclaimer = true,
  layout = "center",
}: PageShellProps) {
  const mainClass =
    layout === "scroll"
      ? "relative z-10 mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-5 py-6 sm:px-6"
      : "relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-10 sm:px-6";

  return (
    <div className="relative min-h-screen bg-white text-dawn-text">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <main className={mainClass}>
        <header className="mb-6 shrink-0 text-center">
          <h1 className="text-xl font-bold tracking-wide text-dawn-navy-deep sm:text-2xl">
            死生観診断
          </h1>
          {layout === "center" && (
            <p className="mt-1 text-xs text-dawn-muted">
              16タイプで、いまのあなたを映し出す
            </p>
          )}
        </header>
        {children}
        {showDisclaimer && (
          <p className="mt-8 shrink-0 text-center text-[0.7rem] leading-relaxed text-dawn-muted/90">
            本診断は自己理解のためのコンテンツです。深刻な不安がある場合は、信頼できる医療・相談窓口をご利用ください。
          </p>
        )}
      </main>
    </div>
  );
}
