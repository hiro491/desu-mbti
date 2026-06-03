import type { BoardPage } from "@/types/database";

export function getPageLabel(page: BoardPage): string {
  return page.page_label?.trim() || "みんなの寄せ書き";
}

export function getPersonName(page: BoardPage): string {
  return page.person_name?.trim() || page.title?.trim() || "みんなの寄せ書き";
}

export function getAvatarUrl(page: BoardPage): string {
  return page.avatar_url?.trim() || "/avatar-placeholder.svg";
}
