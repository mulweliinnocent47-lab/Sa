// lib/plannerAPIFetch.js  (server only: used by server components)
import { headers } from "next/headers";

/**
 * Loads the student's planned sessions from /api/plannerFetch.
 * - Uses an absolute URL (a relative fetch fails on the server)
 * - Forwards the login cookie so the API knows who the user is
 * - Never throws: if anything fails the page just shows no planned sessions
 */
export async function getPlannedSessions() {
  try {
    const h = await Promise.resolve(headers());
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

    const res = await fetch(`${proto}://${host}/api/plannerFetch`, {
      headers: { cookie: h.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const rows = await res.json();
    if (!Array.isArray(rows)) return [];

    return rows.map((e) => ({
      id: String(e.id),
      subject: e.subject,
      topic: e.topic ?? "",
      title: e.title ?? `${e.subject}${e.topic ? ` · ${e.topic}` : ""}`,
      kind: e.kind ?? "10 questions",
      minutes: Number(e.minutes) || 30, // `time` is a clock time like "16:00", not a duration
      time: e.time,
      level: e.level,
      planned: true,
    }));
  } catch (err) {
    console.error("getPlannedSessions failed:", err);
    return [];
  }
}
