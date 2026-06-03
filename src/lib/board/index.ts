import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BoardPage, Message, Photo, CreatePageInput } from "@/types/database";
import * as local from "@/lib/board/local";
import * as supabase from "@/lib/board/supabase";

/** ローカル開発のみ。Vercel 等の本番では Supabase 必須 */
export function usesLocalStorage() {
  return !isSupabaseConfigured() && !process.env.VERCEL;
}

export async function createPage(input: CreatePageInput): Promise<string> {
  if (usesLocalStorage()) {
    return local.localCreatePage(input);
  }
  if (!isSupabaseConfigured()) {
    throw new Error(
      "本番環境では Supabase の環境変数が必要です（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）"
    );
  }
  return supabase.supabaseCreatePage(input);
}

export async function getPage(pageId: string): Promise<BoardPage | null> {
  if (usesLocalStorage()) {
    return local.localGetPage(pageId);
  }
  return supabase.supabaseGetPage(pageId);
}

export async function getPageData(pageId: string): Promise<{
  page: BoardPage;
  messages: Message[];
  photos: Photo[];
} | null> {
  const page = await getPage(pageId);
  if (!page) return null;

  const messages = usesLocalStorage()
    ? await local.localGetMessages(pageId)
    : await supabase.supabaseGetMessages(pageId);

  const photos = usesLocalStorage()
    ? await local.localGetPhotos(pageId)
    : await supabase.supabaseGetPhotos(pageId);

  return { page, messages, photos };
}

export async function addMessage(
  pageId: string,
  senderName: string,
  content: string
): Promise<void> {
  if (usesLocalStorage()) {
    await local.localAddMessage(pageId, senderName, content);
    return;
  }
  await supabase.supabaseAddMessage(pageId, senderName, content);
}

export async function addPhoto(
  pageId: string,
  senderName: string,
  file: File
): Promise<void> {
  if (usesLocalStorage()) {
    await local.localAddPhoto(pageId, senderName, file);
    return;
  }
  await supabase.supabaseAddPhoto(pageId, senderName, file);
}
