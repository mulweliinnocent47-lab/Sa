// lib/tasksConfig.js
// THE place to change daily/weekly tasks and XP rewards.
// Pure functions only (no database), so it can be used on server and client.
//
// A task is finished when enough matching events happened in its period:
//   daily  = since 00:00 today (South Africa time)
//   weekly = since 00:00 on Monday (South Africa time)
// The server (lib/xpServer.js) logs the events and hands out the XP once per period.

export const TZ = "Africa/Johannesburg";
const SAST_MS = 2 * 3600 * 1000; // South Africa is UTC+2 all year (no daylight saving)

// ── event types the app logs ──────────────────────────────────────────
export const EVENTS = {
  PRACTICE_DONE: "practice_done", // finished a practice session (meta: percent, subject, title)
  AI_MESSAGE: "ai_message", //       asked the AI tutor / Test yourself
  PLAN_ADDED: "plan_added", //       added a planner session
  PLAN_DONE: "plan_done", //         ticked a planner session off
};
const STUDY_EVENTS = Object.values(EVENTS);

// ── the tasks ─────────────────────────────────────────────────────────
export const TASKS = [
  // DAILY
  { key: "d_practice", period: "daily", title: "Finish a practice session", event: EVENTS.PRACTICE_DONE, target: 1, xp: 20, href: "/exam-centre" },
  { key: "d_ai", period: "daily", title: "Ask the AI 3 questions", event: EVENTS.AI_MESSAGE, target: 3, xp: 15, href: "/practice" },
  { key: "d_plan", period: "daily", title: "Plan a study session", event: EVENTS.PLAN_ADDED, target: 1, xp: 10, href: "/planner" },
  { key: "d_done", period: "daily", title: "Tick off a planned session", event: EVENTS.PLAN_DONE, target: 1, xp: 15, href: "/planner" },
  // WEEKLY
  { key: "w_practice", period: "weekly", title: "Finish 5 practice sessions", event: EVENTS.PRACTICE_DONE, target: 5, xp: 75, href: "/exam-centre" },
  { key: "w_score", period: "weekly", title: "Score 70% or more in 2 sessions", event: EVENTS.PRACTICE_DONE, target: 2, minPercent: 70, xp: 80, href: "/exam-centre" },
  { key: "w_days", period: "weekly", title: "Study on 4 different days", distinctDays: 4, xp: 100, href: "/planner" },
  { key: "w_done", period: "weekly", title: "Tick off 5 planned sessions", event: EVENTS.PLAN_DONE, target: 5, xp: 60, href: "/planner" },
];

// ── time helpers (South Africa time) ──────────────────────────────────
const shifted = (d) => new Date(d.getTime() + SAST_MS);

/** "2026-11-05" for the SA calendar day of `d` */
export function dayKey(d = new Date()) {
  return shifted(d).toISOString().slice(0, 10);
}

/** The instant of 00:00 SA time today */
export function dayStart(d = new Date()) {
  const s = shifted(d);
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()) - SAST_MS);
}

/** The instant of 00:00 SA time on the Monday of this week */
export function weekStart(d = new Date()) {
  const s = shifted(d);
  const back = (s.getUTCDay() + 6) % 7; // Monday = 0
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() - back) - SAST_MS);
}

/** ISO week label such as "2026-W45" */
export function weekKey(d = new Date()) {
  const s = shifted(d);
  const t = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()));
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) + 3); // Thursday of this week
  const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((t - firstThu) / 86_400_000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export const periodKey = (period, d = new Date()) => (period === "daily" ? dayKey(d) : weekKey(d));

// ── task progress ─────────────────────────────────────────────────────
function progressFor(task, events) {
  if (task.distinctDays) {
    const days = new Set(events.filter((e) => STUDY_EVENTS.includes(e.type)).map((e) => dayKey(new Date(e.created_at))));
    return days.size;
  }
  let list = events.filter((e) => e.type === task.event);
  if (task.minPercent) list = list.filter((e) => Number(e.meta?.percent) >= task.minPercent);
  return list.length;
}

/**
 * events = this week's events: [{ type, meta, created_at }]
 * Returns every task with its progress for the current day / week.
 */
export function evaluateTasks(events, now = new Date()) {
  const dStart = dayStart(now).getTime();
  const wStart = weekStart(now).getTime();

  return TASKS.map((task) => {
    const since = task.period === "daily" ? dStart : wStart;
    const inPeriod = events.filter((e) => new Date(e.created_at).getTime() >= since);
    const target = task.distinctDays ?? task.target;
    const progress = Math.min(progressFor(task, inPeriod), target);
    return { ...task, target, progress, done: progress >= target, periodKey: periodKey(task.period, now) };
  });
}

// ── levels ────────────────────────────────────────────────────────────
// Level n starts at 50 * n * (n - 1) XP:  L2 = 100, L3 = 300, L4 = 600, L5 = 1000 ...
export const xpForLevel = (n) => 50 * n * (n - 1);
export const levelFromXp = (xp) => Math.max(1, Math.floor((1 + Math.sqrt(1 + Math.max(0, xp) / 12.5)) / 2));

export function levelProgress(xp) {
  const level = levelFromXp(xp);
  const from = xpForLevel(level);
  const to = xpForLevel(level + 1);
  return { level, from, to, into: xp - from, need: to - from, pct: Math.round(((xp - from) / (to - from)) * 100) };
}

/** Consecutive SA days (ending today or yesterday) that have at least one study event */
export function computeStreak(isoDates, now = new Date()) {
  const days = new Set(isoDates.map((d) => dayKey(new Date(d))));
  let cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - 86_400_000); // today not done yet: streak is still alive
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}
