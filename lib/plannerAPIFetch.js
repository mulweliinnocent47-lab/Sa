
import { createClient } from "@/utils/supabase/server";

const TABLE = "planner";
const USER_COLUMN = "user_id";

export async function getPlannedSessions() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data: rows, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq(USER_COLUMN, user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPlannedSessions:", error.message);
    return [];
  }

  return (rows ?? []).map((e) => ({
    id: `${e.subject} · ${e.topic}`,
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
