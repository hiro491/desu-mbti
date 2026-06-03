export const SITE_NAME = "デスMBTI";
export const SITE_DESCRIPTION =
  "死生観の4次元（F/A・S/N・I/C・タツトリ/ノトナレ）から、今のあなたの終わり方スタイルを16タイプで診断します。";

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
