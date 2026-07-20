import { isDiagnosisResultRecord } from "@/lib/diagnosis-record";
import {
  getDiagnosisCollectionName,
  getFirestoreDb,
} from "@/lib/server/firebase-admin";
import type { DiagnosisResultRecord } from "@/types/diagnosis";

export async function listDiagnosisRecordsFromFirestore(): Promise<
  DiagnosisResultRecord[]
> {
  const db = getFirestoreDb();
  const snapshot = await db.collection(getDiagnosisCollectionName()).get();

  return snapshot.docs
    .map((doc) => doc.data())
    .filter(isDiagnosisResultRecord)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime(),
    );
}

export async function saveDiagnosisRecordToFirestore(
  record: DiagnosisResultRecord,
): Promise<DiagnosisResultRecord> {
  const db = getFirestoreDb();
  await db
    .collection(getDiagnosisCollectionName())
    .doc(record.id)
    .set(record, { merge: true });
  return record;
}
