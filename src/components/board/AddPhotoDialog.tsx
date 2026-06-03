"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { postPhoto } from "@/app/actions/post-photo";
import { AddActionButton } from "@/components/board/AddActionButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type AddPhotoDialogProps = {
  pageId: string;
};

export function AddPhotoDialog({ pageId }: AddPhotoDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError("");

    if (!selected) {
      setFile(null);
      return;
    }

    if (!selected.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("ファイルサイズは5MB以下にしてください");
      setFile(null);
      return;
    }

    setFile(selected);
  }

  function resetForm() {
    setSenderName("");
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("写真を選択してください");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("pageId", pageId);
    formData.set("senderName", senderName.trim());
    formData.set("file", file);

    try {
      await postPhoto(formData);
    } catch {
      setLoading(false);
      setError("写真の投稿に失敗しました。もう一度お試しください。");
      return;
    }

    setLoading(false);
    setOpen(false);
    resetForm();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <button type="button" className="w-full text-left">
            <AddActionButton label="写真を追加" />
          </button>
        }
      />
      <DialogContent className="rounded-[1.75rem] border-none bg-[#faf9f7] sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-[#4a4a4a]">
              写真を送る
            </DialogTitle>
            <DialogDescription className="text-[#8a8580]">
              お名前を入力し、写真を選んで送信してください
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="photo-sender" className="font-medium text-[#5c5c5c]">
                お名前 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="photo-sender"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="山田 太郎"
                className="h-11 rounded-xl border-[#e8e4de] bg-white text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo-file" className="font-medium text-[#5c5c5c]">
                写真 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="photo-file"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="h-11 rounded-xl border-[#e8e4de] bg-white text-base file:font-medium"
              />
              <p className="text-xs text-[#9a9590]">
                JPEG / PNG / WebP / GIF（5MBまで）
              </p>
            </div>

            {previewUrl && (
              <div className="overflow-hidden rounded-2xl border border-[#e8e4de] bg-white">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={previewUrl}
                    alt="プレビュー"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-full text-base font-medium"
              disabled={loading || !senderName.trim() || !file}
            >
              {loading ? "送信中…" : "追加する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
