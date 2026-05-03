import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type RequiredSupabaseEnv = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY';

interface SupabaseImportMetaEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

function readRequiredEnv(name: RequiredSupabaseEnv): string {
  const value = (import.meta as ImportMeta & { env?: SupabaseImportMetaEnv }).env?.[name];
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let clientSingleton: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (clientSingleton) {
    return clientSingleton;
  }

  const url = readRequiredEnv('VITE_SUPABASE_URL');
  const anonKey = readRequiredEnv('VITE_SUPABASE_ANON_KEY');

  clientSingleton = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientSingleton;
}

export const supabase = getSupabaseClient();

export const auth = supabase.auth;
export const db = supabase;

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    throw error;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface DatabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
  };
}

export function handleDatabaseError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: DatabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: undefined,
      email: undefined,
    },
  };

  const errorString = JSON.stringify(errInfo);
  console.error('Database Error:', errorString);
  throw new Error(errorString);
}

export const handleFirestoreError = handleDatabaseError;

type LegacyQueryLike = Record<string, unknown>;
type LegacyDocRef = { path: string };
type LegacyCollectionRef = { path: string };

type LegacySnapshotDoc = {
  id: string;
  data: () => Record<string, unknown>;
};

type LegacyQuerySnapshot = {
  docs: LegacySnapshotDoc[];
};

export function collection(_db: unknown, ...segments: string[]): LegacyCollectionRef {
  return { path: segments.join('/') };
}

export function collectionGroup(_db: unknown, segment: string): LegacyCollectionRef {
  return { path: segment };
}

export function doc(_db: unknown, ...segments: string[]): LegacyDocRef {
  return { path: segments.join('/') };
}

export function query(base: LegacyCollectionRef | LegacyQueryLike, ...clauses: LegacyQueryLike[]): LegacyQueryLike {
  return { base, clauses };
}

export function where(field: string, op: string, value: unknown): LegacyQueryLike {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): LegacyQueryLike {
  return { type: 'orderBy', field, direction };
}

export function limit(count: number): LegacyQueryLike {
  return { type: 'limit', count };
}

export function onSnapshot(
  _queryRef: LegacyQueryLike | LegacyCollectionRef,
  onNext: (snapshot: LegacyQuerySnapshot) => void,
  _onError?: (error: unknown) => void,
): () => void {
  onNext({ docs: [] });
  return () => {};
}

export async function getDocs(_queryRef: LegacyQueryLike | LegacyCollectionRef): Promise<LegacyQuerySnapshot> {
  return { docs: [] };
}

export async function getDoc(_docRef: LegacyDocRef): Promise<{ exists: () => boolean; data: () => Record<string, unknown>; id: string }> {
  return {
    exists: () => false,
    data: () => ({}),
    id: '',
  };
}

export async function addDoc(_collectionRef: LegacyCollectionRef, _data: unknown): Promise<{ id: string }> {
  return { id: crypto.randomUUID() };
}

export async function setDoc(_docRef: LegacyDocRef, _data: unknown): Promise<void> {}

export async function updateDoc(_docRef: LegacyDocRef, _data: unknown): Promise<void> {}

export async function deleteDoc(_docRef: LegacyDocRef): Promise<void> {}
