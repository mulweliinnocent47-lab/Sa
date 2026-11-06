// lib/profileServer.js  (server only)
import "server-only";
import { PROFILE_TABLE, usernameFromUser, validateProfile } from "@/lib/profileConfig";

/**
 * Returns the user's profile row, creating it the first time.
 * Uses the signed-in user's own client, so row level security still applies.
 * Returns null if the table does not exist yet (the app keeps working without it).
 */
export async function getOrCreateProfile(supabase, user) {
  if (!user) return null;

  const { data: found, error: readError } = await supabase
    .from(PROFILE_TABLE).select("*").eq("user_id", user.id).maybeSingle();
  if (readError) {
    console.error("profile read:", readError.message);
    return null;
  }
  if (found) return found;

  const base = usernameFromUser(user);
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = attempt === 0 ? "" : String(Math.floor(100 + Math.random() * 900));
    const username = (base.slice(0, 20 - suffix.length) + suffix);
    const { data, error } = await supabase
      .from(PROFILE_TABLE).insert({ user_id: user.id, username, grade: 12 }).select().single();
    if (!error) return data;
    if (error.code === "23505") {
      // username taken, or another request just created this row
      const { data: again } = await supabase.from(PROFILE_TABLE).select("*").eq("user_id", user.id).maybeSingle();
      if (again) return again;
      continue;
    }
    console.error("profile create:", error.message);
    return null;
  }
  return null;
}

/** Saves the profile form. Returns { ok, profile } or { ok:false, status, error, errors } */
export async function saveProfile(supabase, user, input) {
  const checked = validateProfile(input);
  if (!checked.ok) return { ok: false, status: 400, error: "Please fix the highlighted fields.", errors: checked.errors };

  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .upsert({ user_id: user.id, ...checked.value, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, status: 409, error: "That username is taken.", errors: { username: "That username is taken." } };
    console.error("profile save:", error.message);
    return { ok: false, status: 500, error: "Could not save your profile." };
  }
  return { ok: true, profile: data };
}
