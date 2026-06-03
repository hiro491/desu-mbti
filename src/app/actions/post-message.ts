"use server";

import { addMessage } from "@/lib/board";

export async function postMessage(
  pageId: string,
  senderName: string,
  content: string
) {
  await addMessage(pageId, senderName.trim(), content.trim());
}
