// lib/plannerAPIFetch.js  (server only)
// Reads the plans straight from Supabase. No fetch(), so no URL problem.
import { createClient } from "@/utils/supabase/server";

// ← set these two to match the table your planner form saves into
const TABLE = "planner";
const USER_COLUMN = "user_id";

export async function getPlannedSessions() {
  const supabase = await createClient();
     const { data: rows, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq(USER_COLUMN, user.id)
      .eq("done", false)
      .order("created_at", { ascending: false });

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
      minutes: 15,
      time: e.time,
      level: e.level,
      planned: true,
    }));

}




