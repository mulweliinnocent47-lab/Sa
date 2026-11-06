// lib/plannerAPIFetch.js  (server only)
// Reads the student's planned sessions straight from Supabase (no fetch(), so no URL problems).
import "server-only";
import { getCurrentUser } from "@/lib/authServer";

const TABLE = "planner";
const USER_COLUMN = "user_id";

/** "time" is the length of the session in minutes. Keep it sensible even if the row is odd. */
const toMinutes = (t) => {
  const n = Math.round(Number(t));
  return Number.isFinite(n) ? Math.min(240, Math.max(5, n)) : 15;
};

/**
 * pendingOnly = true  -> only sessions not ticked off yet (Exam Centre)
 * pendingOnly = false -> everything (Planner page, practice page lookup)
 */
export async function getPlannedSessions({ pendingOnly = false } = {}) {
  const { supabase, user } = await getCurrentUser();
  if (!user) return [];

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq(USER_COLUMN, user.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (pendingOnly) query = query.eq("done", false);

  const { data: rows, error } = await query;
  if (error) {
    console.error("getPlannedSessions:", error.message);
    return [];
  }

  return (rows ?? []).map((e) => ({
    id: String(e.id),
    subject: e.subject,
    topic: e.topic,
    title: `${e.subject} · ${e.topic}`,
    kind: "10 questions",
    minutes: toMinutes(e.time),
    level: e.level,
    done: !!e.done,
    createdAt: e.created_at,
    planned: true,
  }));
}
