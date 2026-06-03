export const SITE_NAME = "みんなの寄せ書き";
export const SITE_DESCRIPTION =
  "ボタンひとつで寄せ書きページができ、メッセージと写真がみんなで集まります";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getPublicPageUrl(pageId: string): string {
  return `${getSiteUrl()}/pages/${pageId}`;
}
