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
        className="btn-gray inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
      >
        <span aria-hidden>𝕏</span>
        Xでシェア
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-gray inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
      >
        LINEでシェア
      </a>
    </div>
  );
}
