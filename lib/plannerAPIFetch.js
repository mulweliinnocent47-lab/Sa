// lib/plannerAPIFetch.js  (server only)
// Reads the plans straight from Supabase. No fetch(), so no URL problem.
import { createClient } from "@/utils/supabase/server";

// ← set these two to match the table your planner form saves into
const TABLE = "planner";
const USER_COLUMN = "user_id";

export async function getPlannedSessions() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: rows, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq(USER_COLUMN, user.id);

    if (error) {
      console.error("getPlannedSessions:", error.message);
      return [];
    }

    return (rows ?? []).map((e) => ({
      id: String(e.id),
      subject: e.subject,
      topic: e.topic ?? "",
      title: e.title ?? `${e.subject}${e.topic ? ` · ${e.topic}` : ""}`,
      kind: e.kind ?? "10 questions",
      minutes: e.time, 
      time: e.time,
      level: e.level,
      planned: true,
    }));
  } catch (err) {
    console.error("getPlannedSessions failed:", err);
    return [];
  }
}
