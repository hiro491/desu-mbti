import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";

function safeExt(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return ["jpeg", "jpg", "png", "webp", "gif"].includes(ext)
    ? ext === "jpeg"
      ? "jpg"
      : ext
    : "jpg";
}

export async function saveAvatar(
  pageId: string,
  file: File
): Promise<string> {
  const ext = safeExt(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isSupabaseConfigured()) {
    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(dir, { recursive: true });
    const filename = `${pageId}.${ext}`;
    await writeFile(path.join(dir, filename), buffer);
    return `/uploads/avatars/${filename}`;
  }

  const supabase = await createClient();
  const storagePath = `${pageId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("page-photos")
    .upload(storagePath, file, { upsert: true });

  if (error) {
    throw new Error("プロフィール画像のアップロードに失敗しました");
  }

  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/page-photos/${storagePath}`;
}
