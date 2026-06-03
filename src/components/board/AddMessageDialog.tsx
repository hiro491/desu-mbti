"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postMessage } from "@/app/actions/post-message";
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
import { Textarea } from "@/components/ui/textarea";

type AddMessageDialogProps = {
  pageId: string;
};

export function AddMessageDialog({ pageId }: AddMessageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await postMessage(pageId, senderName, content);
    } catch {
      setLoading(false);
      setError("送信に失敗しました。もう一度お試しください。");
      return;
    }

    setLoading(false);
    setOpen(false);
    setSenderName("");
    setContent("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button type="button" className="w-full text-left">
            <AddActionButton label="メッセージを追加" />
          </button>
        }
      />
      <DialogContent className="rounded-[1.75rem] border-none bg-[#faf9f7] sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-[#4a4a4a]">
              メッセージを送る
            </DialogTitle>
            <DialogDescription className="text-[#8a8580]">
              お名前とメッセージを入力して送信してください
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sender-name" className="font-medium text-[#5c5c5c]">
                お名前 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sender-name"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="山田 太郎"
                className="h-11 rounded-xl border-[#e8e4de] bg-white text-base"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="message-content"
                className="font-medium text-[#5c5c5c]"
              >
                メッセージ <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message-content"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="いつもありがとうございました！"
                rows={5}
                className="rounded-xl border-[#e8e4de] bg-white text-base"
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-full text-base font-medium"
              disabled={loading || !senderName.trim() || !content.trim()}
            >
              {loading ? "送信中…" : "追加する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
