import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { saveAvatar } from "@/lib/board/avatar";
import type { BoardPage, Message, Photo, CreatePageInput } from "@/types/database";

export async function supabaseCreatePage(input: CreatePageInput): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pages")
    .insert({
      title: input.personName,
      page_label: input.pageLabel,
      person_name: input.personName,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      start_time: input.startTime ?? "00:00",
      end_time: input.endTime ?? "00:00",
      user_id: null,
      avatar_url: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "ページの作成に失敗しました");
  }

  const avatarUrl = await saveAvatar(data.id, input.avatarFile);

  const { error: updateError } = await supabase
    .from("pages")
    .update({ avatar_url: avatarUrl })
    .eq("id", data.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return data.id;
}

export async function supabaseGetPage(
  pageId: string
): Promise<BoardPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as BoardPage | null) ?? null;
}

export async function supabaseGetMessages(pageId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Message[];
}

export async function supabaseGetPhotos(pageId: string): Promise<Photo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Photo[];
}

export async function supabaseAddMessage(
  pageId: string,
  senderName: string,
  content: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    page_id: pageId,
    sender_name: senderName,
    content,
  });

  if (error) throw new Error(error.message);
}

export async function supabaseAddPhoto(
  pageId: string,
  senderName: string,
  file: File
): Promise<void> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpeg", "jpg", "png", "webp", "gif"].includes(ext)
    ? ext === "jpeg"
      ? "jpg"
      : ext
    : "jpg";
  const storagePath = `${pageId}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from("page-photos")
    .upload(storagePath, file, { upsert: false });

  if (uploadError) {
    throw new Error("写真のアップロードに失敗しました");
  }

  const { url } = getSupabaseEnv();
  const imageUrl = `${url}/storage/v1/object/public/page-photos/${storagePath}`;

  const { error: insertError } = await supabase.from("photos").insert({
    page_id: pageId,
    image_url: imageUrl,
    sender_name: senderName,
  });

  if (insertError) throw new Error(insertError.message);
}
