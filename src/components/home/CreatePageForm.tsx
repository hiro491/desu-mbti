"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createBoardPage } from "@/app/actions/create-page";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreatePageForm() {
  const onVercelWithoutSupabase =
    Boolean(process.env.NEXT_PUBLIC_VERCEL_URL) && !isSupabaseConfigured();

  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!previewUrl?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createBoardPage(formData);
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "ページの作成に失敗しました"
      );
    }
  }

  if (onVercelWithoutSupabase) {
    return (
      <div className="mx-auto max-w-md rounded-[2rem] bg-white px-6 py-8 text-center shadow-sm">
        <p className="text-sm leading-relaxed text-[#9a9590]">
          本番環境では Supabase の設定が必要です。
          <br />
          Vercel の環境変数に{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> と{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          を追加してください。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md rounded-[2rem] bg-white px-6 py-8 shadow-sm sm:px-8"
    >
      <h2 className="text-center text-lg font-medium text-[#4a4a4a]">
        ページの設定
      </h2>
      <p className="mt-2 text-center text-sm text-[#9a9590]">
        表示名とプロフィール画像を設定してください
      </p>

      <div className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pageLabel" className="text-[#5c5c5c]">
            ページ名（任意）
          </Label>
          <Input
            id="pageLabel"
            name="pageLabel"
            placeholder="例: 田中さんの送別会"
            className="h-11 rounded-xl border-[#e5e2dc] bg-[#faf9f7]"
          />
          <p className="text-xs text-[#9a9590]">画面上部の小さなラベルに表示されます</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="personName" className="text-[#5c5c5c]">
            表示名 <span className="text-[#c45c5c]">*</span>
          </Label>
          <Input
            id="personName"
            name="personName"
            required
            placeholder="例: 田中 太郎"
            className="h-11 rounded-xl border-[#e5e2dc] bg-[#faf9f7]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar" className="text-[#5c5c5c]">
            プロフィール画像 <span className="text-[#c45c5c]">*</span>
          </Label>
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-28 overflow-hidden rounded-full border-[5px] border-white bg-[#e8dfd6] shadow-md">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="プレビュー"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-[#9a9590]">
                  未選択
                </div>
              )}
            </div>
            <Input
              id="avatar"
              ref={fileRef}
              name="avatar"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="h-11 rounded-xl border-[#e5e2dc] bg-[#faf9f7] file:font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-[#5c5c5c]">
            紹介文（任意）
          </Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="ご本人のプロフィールやメッセージをお願いします"
            className="rounded-xl border-[#e5e2dc] bg-[#faf9f7]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-[#5c5c5c]">
              開始日
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              className="h-11 rounded-xl border-[#e5e2dc] bg-[#faf9f7]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-[#5c5c5c]">
              終了日
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              className="h-11 rounded-xl border-[#e5e2dc] bg-[#faf9f7]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-[#5c5c5c]">
              開始時刻
            </Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue="00:00"
              className="h-11 rounded-xl border-[#e5e2dc] bg-[#faf9f7]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-[#5c5c5c]">
              終了時刻
            </Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue="00:00"
              className="h-11 rounded-xl border-[#e5e2dc] bg-[#faf9f7]"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-[#fde8e8] px-3 py-2 text-sm text-[#b44]">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-8 h-12 w-full rounded-full bg-[#4a4a4a] text-base font-medium text-white hover:bg-[#3a3a3a]"
      >
        {loading ? "作成中…" : "HPを作成する"}
      </Button>
    </form>
  );
}
