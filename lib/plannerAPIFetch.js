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
  /*  }
{ id: "maths-quick-10", subject: "Mathematics", title: "Mathematics quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
    { */
    return (rows ?? []).map((e) => ({
      id: String(e.id),
      subject: String(e.subject),
      title: String(e.title),
      kind: "10 questions",
      minutes: Number(e.time), 
      level: String(e.level)
      
    }));
  } catch (err) {
    console.error("getPlannedSessions failed:", err);
    return [];
  }
}
