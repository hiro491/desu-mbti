import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const COLLECTION_NAME = "diagnosis_results";

let firestore: Firestore | null = null;

interface ServiceAccountCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function parseServiceAccountFromJson(
  raw: string,
): ServiceAccountCredentials | null {
  try {
    const parsed = JSON.parse(raw) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };

    if (
      !parsed.project_id ||
      !parsed.client_email ||
      !parsed.private_key
    ) {
      return null;
    }

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  } catch {
    return null;
  }
}

function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (jsonEnv) {
    const fromJson = parseServiceAccountFromJson(jsonEnv);
    if (fromJson) return fromJson;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKey),
    };
  }

  return null;
}

export function isFirestoreConfigured(): boolean {
  return getServiceAccountCredentials() !== null;
}

export function getFirestoreDb(): Firestore {
  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error(
      "Firestore の環境変数が設定されていません。FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY、または FIREBASE_SERVICE_ACCOUNT_JSON を設定してください。",
    );
  }

  if (!firestore) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(credentials),
      });
    }
    const databaseId = process.env.FIRESTORE_DATABASE_ID ?? "(default)";
    firestore = getFirestore(getApps()[0], databaseId);
  }

  return firestore;
}

export function getDiagnosisCollectionName(): string {
  return COLLECTION_NAME;
}
