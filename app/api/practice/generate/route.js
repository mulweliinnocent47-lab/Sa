// app/api/practice/generate/route.js
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 120; // the AI can take a while to write the questions

// The name of the Supabase edge function that writes the questions.
// Its source is in supabase/functions/exam-centre-egde/index.ts
const EDGE_FUNCTION = "exam-centre-egde";
const TYPES = ["multiple_choice", "short_answer", "calculation"];

// POST /api/practice/generate   body: { id, title, subject, minutes, level, topic? }
export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, title, subject, minutes, level, topic } = input ?? {};
  if (!id || !title || !subject || !minutes || !level) {
    return Response.json({ error: "Missing id, title, subject, minutes or level" }, { status: 400 });
  }

  const supabase = await createClient();

  // Practice sessions need a free account (XP, progress and the leaderboard are saved to it)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Please sign in to start a practice session." }, { status: 401 });

  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION, {
    body: {
      id,
      title,
      subject,
      grade: 12,
      curriculum: "South African CAPS/NSC",
      kind: "10 questions",
      questionCount: 10,
      minutes,
      level,
      mode: "practice",
      questionTypes: TYPES,
      instructions: {
        generateQuestions: true,
        generateAnswers: true,
        generateExplanations: true,
        includeMarkAllocation: true,
        shuffleQuestions: true,
      },
      topics: typeof topic === "string" && topic.trim() ? topic.trim().slice(0, 100) : "AI_SELECT_TOPICS",
      outputFormat: "maths_quick_fire_v1",
    },
  });

  if (error || !data?.questions) {
    console.error(`${EDGE_FUNCTION} failed:`, error);
    return Response.json({ error: "Could not generate the session. Try again." }, { status: 502 });
  }

  return Response.json(data); // { sessionId, title, subject, grade, questions[10], totalMarks }
}
