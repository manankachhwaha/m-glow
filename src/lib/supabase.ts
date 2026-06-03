import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

/** Stable anonymous user ID stored in localStorage */
export function getAnonUserId(): string {
  const k = 'anon_user_id';
  const existing = localStorage.getItem(k);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(k, id);
  return id;
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
