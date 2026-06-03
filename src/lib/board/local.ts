import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { BoardPage, Message, Photo, CreatePageInput } from "@/types/database";
import { saveAvatar } from "@/lib/board/avatar";

type LocalDb = {
  pages: BoardPage[];
  messages: Message[];
  photos: Photo[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "board.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureDb(): Promise<LocalDb> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as LocalDb;
  } catch {
    const empty: LocalDb = { pages: [], messages: [], photos: [] };
    await writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
}

async function saveDb(db: LocalDb) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function nowIso() {
  return new Date().toISOString();
}

export async function localCreatePage(input: CreatePageInput): Promise<string> {
  const db = await ensureDb();
  const id = crypto.randomUUID();
  const timestamp = nowIso();
  const avatarUrl = await saveAvatar(id, input.avatarFile);

  const page: BoardPage = {
    id,
    user_id: null,
    title: input.personName,
    page_label: input.pageLabel,
    person_name: input.personName,
    avatar_url: avatarUrl,
    description: input.description,
    start_date: input.startDate,
    end_date: input.endDate,
    start_time: input.startTime ?? "00:00",
    end_time: input.endTime ?? "00:00",
    created_at: timestamp,
    updated_at: timestamp,
  };

  db.pages.push(page);
  await saveDb(db);
  return id;
}

export async function localGetPage(pageId: string): Promise<BoardPage | null> {
  const db = await ensureDb();
  const page = db.pages.find((p) => p.id === pageId);
  if (!page) return null;
  return normalizePage(page);
}

function normalizePage(page: BoardPage): BoardPage {
  return {
    ...page,
    page_label: page.page_label ?? null,
    person_name: page.person_name ?? page.title ?? null,
    avatar_url: page.avatar_url ?? null,
    start_time: page.start_time ?? "00:00",
    end_time: page.end_time ?? "00:00",
  };
}

export async function localGetMessages(pageId: string): Promise<Message[]> {
  const db = await ensureDb();
  return db.messages
    .filter((m) => m.page_id === pageId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function localGetPhotos(pageId: string): Promise<Photo[]> {
  const db = await ensureDb();
  return db.photos
    .filter((p) => p.page_id === pageId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export async function localAddMessage(
  pageId: string,
  senderName: string,
  content: string
): Promise<void> {
  const db = await ensureDb();
  if (!db.pages.some((p) => p.id === pageId)) {
    throw new Error("ページが見つかりません");
  }

  db.messages.push({
    id: crypto.randomUUID(),
    page_id: pageId,
    sender_name: senderName,
    content,
    created_at: nowIso(),
  });

  await saveDb(db);
}

export async function localAddPhoto(
  pageId: string,
  senderName: string,
  file: File
): Promise<void> {
  const db = await ensureDb();
  if (!db.pages.some((p) => p.id === pageId)) {
    throw new Error("ページが見つかりません");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpeg", "jpg", "png", "webp", "gif"].includes(ext)
    ? ext === "jpeg"
      ? "jpg"
      : ext
    : "jpg";
  const filename = `${crypto.randomUUID()}.${safeExt}`;
  const pageDir = path.join(UPLOADS_DIR, pageId);

  await mkdir(pageDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(pageDir, filename), buffer);

  db.photos.push({
    id: crypto.randomUUID(),
    page_id: pageId,
    image_url: `/uploads/${pageId}/${filename}`,
    sender_name: senderName,
    created_at: nowIso(),
  });

  await saveDb(db);
}
