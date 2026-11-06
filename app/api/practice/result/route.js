import { createClient } from "@/utils/supabase/server";
import { recordPracticeResult } from "@/lib/xpServer";

export const dynamic = "force-dynamic";

const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const int = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

// POST /api/practice/result  — saves a finished practice session and returns any XP earned
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const b = await request.json().catch(() => null);
  if (!b || !b.sessionId) return Response.json({ ok: false, error: "Invalid body" }, { status: 400 });

  const totalMarks = int(b.totalMarks, 1, 200);
  const score = int(b.score, 0, totalMarks);
  const questions = int(b.questions, 1, 30);

  const result = await recordPracticeResult(user, {
    sessionId: clip(b.sessionId, 80),
    title: clip(b.title, 120),
    subject: clip(b.subject, 60),
    topic: clip(b.topic, 100),
    level: clip(b.level, 20),
    score,
    totalMarks,
    percent: Math.round((score / totalMarks) * 100),
    secondsUsed: int(b.secondsUsed, 0, 6 * 3600),
    questions,
    answered: int(b.answered, 0, questions),
  });
  return Response.json(result);
}
