// lib/storageCache.js  (server only)
// Lists a Supabase Storage folder and keeps the answer for 10 minutes for ALL visitors.
// Before this, every page view listed every folder again (the slowest part of the app).
//
// It first asks as an anonymous visitor (cacheable). If that returns nothing - for example
// the bucket is only readable by signed-in users - it falls back to the signed-in
// user's own access exactly like before, so nothing breaks.
import "server-only";
import { unstable_cache } from "next/cache";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

const KEY = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function anonClient() {
  return createAnonClient(process.env.NEXT_PUBLIC_SUPABASE_URL, KEY(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const listCached = unstable_cache(
  async (bucket, folder) => {
    const { data, error } = await anonClient()
      .storage.from(bucket)
      .list(folder, { limit: 100, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(error.message); // errors are never cached
    return data ?? [];
  },
  ["storage-list-v1"],
  { revalidate: 600 }
);

/** Files inside bucket/folder (cached). Never throws: returns [] on failure. */
export async function listFolder(bucket, folder) {
  try {
    const files = await listCached(bucket, folder);
    if (files.length) return files;
  } catch {
    // fall through to the signed-in user's access
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: 100, sortBy: { column: "name", order: "asc" } });
    if (error) {
      console.error(`Could not list "${folder}":`, error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    // Next.js uses an error to learn that a page is dynamic: it must never be swallowed
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.digest?.startsWith?.("NEXT_")) throw err;
    console.error(`Could not list "${folder}":`, err?.message ?? err);
    return [];
  }
}

/** Public URL of a file (no network call). */
export function publicUrl(bucket, path) {
  return anonClient().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
