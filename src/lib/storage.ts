import { getSupabaseEnv } from "@/lib/supabase/env";

const BUCKET = "page-photos";

export function buildPhotoStoragePath(pageId: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpeg", "jpg", "png", "webp", "gif"].includes(ext)
    ? ext === "jpeg"
      ? "jpg"
      : ext
    : "jpg";
  return `${pageId}/${crypto.randomUUID()}.${safeExt}`;
}

export function getPublicPhotoUrl(path: string): string {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}
