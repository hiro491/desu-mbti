"use server";

import { redirect } from "next/navigation";
import { createPage } from "@/lib/board";
import type { CreatePageInput } from "@/types/database";

export async function createBoardPage(formData: FormData) {
  const personName = formData.get("personName");
  const avatar = formData.get("avatar");

  if (typeof personName !== "string" || !personName.trim()) {
    throw new Error("表示名を入力してください");
  }
  if (!(avatar instanceof File) || avatar.size === 0) {
    throw new Error("プロフィール画像を選択してください");
  }

  const input: CreatePageInput = {
    pageLabel: getOptionalString(formData.get("pageLabel")),
    personName: personName.trim(),
    description: getOptionalString(formData.get("description")),
    startDate: getOptionalString(formData.get("startDate")),
    endDate: getOptionalString(formData.get("endDate")),
    startTime: getOptionalString(formData.get("startTime")) ?? "00:00",
    endTime: getOptionalString(formData.get("endTime")) ?? "00:00",
    avatarFile: avatar,
  };

  const pageId = await createPage(input);
  redirect(`/pages/${pageId}`);
}

function getOptionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}
