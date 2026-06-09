export const SITE_NAME = "死生観診断";
export const SITE_DESCRIPTION =
  "死への情緒・死後の世界観・他者との距離・終末期のスタンスの4つの軸から、今のあなたの死生観を16タイプで診断します。";

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
