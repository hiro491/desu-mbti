"use server";

import { addPhoto } from "@/lib/board";

export async function postPhoto(formData: FormData) {
  const pageId = formData.get("pageId");
  const senderName = formData.get("senderName");
  const file = formData.get("file");

  if (typeof pageId !== "string" || !pageId) {
    throw new Error("ページIDが不正です");
  }
  if (typeof senderName !== "string" || !senderName.trim()) {
    throw new Error("お名前を入力してください");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("写真を選択してください");
  }

  await addPhoto(pageId, senderName.trim(), file);
}
