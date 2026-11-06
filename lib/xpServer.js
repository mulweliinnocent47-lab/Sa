// lib/xpServer.js  (server only)
// Logs study events, hands out XP for finished tasks, and reads the numbers
// the Progress, Profile, Exam Centre and Leaderboard pages show.
import "server-only";
import { getAdmin } from "@/lib/supabaseAdmin";
import { getOrCreateProfile } from "@/lib/profileServer";
import { evaluateTasks, weekStart, dayStart, dayKey, weekKey, TASKS } from "@/lib/tasksConfig";

const NONE = { ok: false, gained: 0, awarded: [] };

/** Gives XP for every task that is now complete and has not been paid yet. */
async function awardCompleted(admin, userId, now = new Date()) {
  const { data: events, error } = await admin
    .from("user_events").select("type, meta, created_at")
    .eq("user_id", userId).gte("created_at", weekStart(now).toISOString()).limit(2000);
  if (error) throw error;

  const done = evaluateTasks(events ?? [], now).filter((t) => t.done);
  if (!done.length) return { ok: true, gained: 0, awarded: [] };

  const { data: existing, error: e2 } = await admin
    .from("task_awards").select("task_key, period_key")
    .eq("user_id", userId).in("period_key", [dayKey(now), weekKey(now)]);
  if (e2) throw e2;

  const have = new Set((existing ?? []).map((a) => `${a.task_key}|${a.period_key}`));
  const rows = done
    .filter((t) => !have.has(`${t.key}|${t.periodKey}`))
    .map((t) => ({ user_id: userId, task_key: t.key, period_key: t.periodKey, xp: t.xp }));
  if (!rows.length) return { ok: true, gained: 0, awarded: [] };

  // ignoreDuplicates + select() returns ONLY rows that were really inserted (safe against double clicks)
  const { data: inserted, error: e3 } = await admin
    .from("task_awards")
    .upsert(rows, { onConflict: "user_id,task_key,period_key", ignoreDuplicates: true })
    .select("task_key, xp");
  if (e3) throw e3;

  const awarded = (inserted ?? []).map((r) => ({
    key: r.task_key, xp: r.xp, title: TASKS.find((t) => t.key === r.task_key)?.title ?? r.task_key,
  }));
  return { ok: true, gained: awarded.reduce((s, a) => s + a.xp, 0), awarded };
}

/** Logs one study event and returns any XP it earned: { ok, gained, awarded[] } */
export async function recordEvent(user, type, meta = {}, { dailyCap = 0 } = {}) {
  const admin = getAdmin();
  if (!admin || !user) return NONE;
  try {
    if (dailyCap > 0) {
      // keep the table small: after `dailyCap` events of this type today we stop logging more
      const { count } = await admin
        .from("user_events").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("type", type).gte("created_at", dayStart().toISOString());
      if ((count ?? 0) >= dailyCap) return { ok: true, gained: 0, awarded: [] };
    }
    await getOrCreateProfile(admin, user); // the leaderboard only lists users that have a profile row
    const { error } = await admin.from("user_events").insert({ user_id: user.id, type, meta });
    if (error) throw error;
    return await awardCompleted(admin, user.id);
  } catch (err) {
    console.error("recordEvent:", err?.message ?? err);
    return NONE;
  }
}

/** Saves a finished practice session and logs the XP event. */
export async function recordPracticeResult(user, r) {
  const admin = getAdmin();
  if (!admin || !user) return NONE;
  try {
    const { error } = await admin.from("practice_results").insert({
      user_id: user.id,
      session_id: r.sessionId, title: r.title, subject: r.subject, topic: r.topic || null, level: r.level,
      score: r.score, total_marks: r.totalMarks, percent: r.percent,
      seconds_used: r.secondsUsed, questions: r.questions, answered: r.answered,
    });
    if (error) throw error;

    // Anti-cheat: sessions that were clearly skipped through earn no XP
    const honest = r.answered >= 3 && r.secondsUsed >= 30;
    if (!honest) return { ok: true, gained: 0, awarded: [] };
    return await recordEvent(user, "practice_done", { percent: r.percent, subject: r.subject, title: r.title });
  } catch (err) {
    console.error("recordPracticeResult:", err?.message ?? err);
    return NONE;
  }
}

// ───────────────────────── reading (uses the user's own client + RLS) ─────────────────────────

/** This week's events, for task progress. Returns [] if the tables are not created yet. */
export async function getWeekEvents(supabase, userId, now = new Date()) {
  const { data, error } = await supabase
    .from("user_events").select("type, meta, created_at")
    .eq("user_id", userId).gte("created_at", weekStart(now).toISOString()).limit(2000);
  if (error) {
    console.error("getWeekEvents:", error.message);
    return null;
  }
  return data ?? [];
}

/** { total, week } XP for a user, or null if the table is missing */
export async function getMyXp(supabase, userId, now = new Date()) {
  const { data, error } = await supabase.from("task_awards").select("xp, created_at").eq("user_id", userId);
  if (error) {
    console.error("getMyXp:", error.message);
    return null;
  }
  const ws = weekStart(now).getTime();
  let total = 0, week = 0;
  for (const r of data ?? []) {
    total += r.xp;
    if (new Date(r.created_at).getTime() >= ws) week += r.xp;
  }
  return { total, week };
}

/** Top players. period: "week" | "all". Returns null if the SQL function is missing. */
export async function getLeaderboard(supabase, period = "week") {
  const { data, error } = await supabase.rpc("get_leaderboard", { period, max_rows: 50 });
  if (error) {
    console.error("getLeaderboard:", error.message);
    return null;
  }
  return data ?? [];
}

/** Practice results since `sinceISO` (or everything). Newest first. */
export async function getPracticeResults(supabase, userId, sinceISO = null, limit = 500) {
  let q = supabase
    .from("practice_results")
    .select("session_id, title, subject, percent, score, total_marks, seconds_used, created_at")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (sinceISO) q = q.gte("created_at", sinceISO);
  const { data, error } = await q;
  if (error) {
    console.error("getPracticeResults:", error.message);
    return null;
  }
  return data ?? [];
}

/** Dates (ISO strings) of recent study activity, for the streak. */
export async function getActivityDates(supabase, userId, days = 60) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("user_events").select("created_at").eq("user_id", userId).gte("created_at", since).limit(3000);
  if (error) return [];
  return (data ?? []).map((r) => r.created_at);
}
