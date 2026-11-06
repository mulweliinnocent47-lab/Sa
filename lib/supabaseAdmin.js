// lib/supabaseAdmin.js  (server only)
// Uses the service-role key, which bypasses row level security.
// That is what lets only OUR server hand out XP, so nobody can edit their own score.
import "server-only";
import { createClient } from "@supabase/supabase-js";

let client = null;

/** Returns null when SUPABASE_SERVICE_ROLE_KEY is not set (XP and push then switch themselves off). */
export function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
