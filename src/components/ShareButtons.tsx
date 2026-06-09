"use client";

interface ShareButtonsProps {
  shareText: string;
  shareUrl: string;
}

export function ShareButtons({ shareText, shareUrl }: ShareButtonsProps) {
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-dawn-surface px-5 py-3 text-sm font-medium text-dawn-text transition hover:bg-dawn-border"
      >
        <span aria-hidden>𝕏</span>
        Xでシェア
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06C755] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        LINEでシェア
      </a>
    </div>
  );
}
