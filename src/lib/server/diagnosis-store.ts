import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDiagnosisResultRecord } from "@/lib/diagnosis-record";
import { isFirestoreConfigured } from "@/lib/server/firebase-admin";
import {
  listDiagnosisRecordsFromFirestore,
  saveDiagnosisRecordToFirestore,
} from "@/lib/server/firestore-diagnosis-store";
import type { DiagnosisResultRecord } from "@/types/diagnosis";

const DATA_DIR = path.join(process.cwd(), ".data");
const RESULTS_FILE = path.join(DATA_DIR, "diagnosis-results.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readAllRecordsFromFile(): Promise<DiagnosisResultRecord[]> {
  try {
    const raw = await readFile(RESULTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isDiagnosisResultRecord)
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime(),
      );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function saveDiagnosisRecordToFile(
  record: DiagnosisResultRecord,
): Promise<DiagnosisResultRecord> {
  await ensureDataDir();
  const records = await readAllRecordsFromFile();
  const existingIndex = records.findIndex((item) => item.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  await writeFile(RESULTS_FILE, JSON.stringify(records, null, 2), "utf8");
  return record;
}

export function getDiagnosisStorageBackend(): "firestore" | "file" {
  return isFirestoreConfigured() ? "firestore" : "file";
}

export async function listDiagnosisRecords(): Promise<DiagnosisResultRecord[]> {
  if (isFirestoreConfigured()) {
    return listDiagnosisRecordsFromFirestore();
  }
  return readAllRecordsFromFile();
}

export async function saveDiagnosisRecord(
  record: DiagnosisResultRecord,
): Promise<DiagnosisResultRecord> {
  if (isFirestoreConfigured()) {
    return saveDiagnosisRecordToFirestore(record);
  }
  return saveDiagnosisRecordToFile(record);
}
