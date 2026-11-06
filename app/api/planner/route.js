import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { recordEvent } from "@/lib/xpServer";
import { verifyTopic } from "@/lib/topicCheck";

export const dynamic = "force-dynamic";

const LEVELS = ["Easy", "Medium", "Hard", "Extreme"];

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// POST /api/planner  body: { subject, topic, level, time }   (time = minutes)
export async function POST(request) {
  try {
    const { supabase, user } = await currentUser();
    if (!user) return NextResponse.json({ ok: false, error: "Please sign in to plan sessions." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const subject = String(body.subject ?? "").trim().slice(0, 60);
    const topic = String(body.topic ?? "").trim();
    const level = String(body.level ?? "");
    const minutes = Math.round(Number(body.time));

    if (!subject || !topic || !level || !body.time) {
      return NextResponse.json({ ok: false, error: "All fields are required." }, { status: 400 });
    }
    if (!LEVELS.includes(level)) {
      return NextResponse.json({ ok: false, error: "Choose a level from the list." }, { status: 400 });
    }
    if (!Number.isFinite(minutes) || minutes < 5 || minutes > 240) {
      return NextResponse.json({ ok: false, error: "Choose between 5 and 240 minutes." }, { status: 400 });
    }

    // Hook for "is this school work?" (see lib/topicCheck.js)
    const check = verifyTopic(subject, topic);
    if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 422 });

    const { data, error } = await supabase
      .from("planner")
      .insert({ user_id: user.id, subject, topic, time: String(minutes), level })
      .select()
      .single();
    if (error) throw error;

    const xp = await recordEvent(user, "plan_added", { subject });
    return NextResponse.json({ ok: true, success: true, planner: data, xp });
  } catch (error) {
    console.error("Planner error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create planner entry." }, { status: 500 });
  }
}

// PATCH /api/planner  body: { id }  — ticks a session off (one way, so XP cannot be farmed)
export async function PATCH(request) {
  try {
    const { supabase, user } = await currentUser();
    if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const { id } = await request.json().catch(() => ({}));
    if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

    const { data, error } = await supabase
      .from("planner").update({ done: true })
      .eq("id", id).eq("user_id", user.id).eq("done", false)
      .select();
    if (error) throw error;

    // Only the first tick earns XP
    const xp = data?.length ? await recordEvent(user, "plan_done", { subject: data[0].subject }) : { ok: true, gained: 0, awarded: [] };
    return NextResponse.json({ ok: true, xp });
  } catch (error) {
    console.error("Planner tick error:", error);
    return NextResponse.json({ ok: false, error: "Could not update the session." }, { status: 500 });
  }
}

// DELETE /api/planner?id=...
export async function DELETE(request) {
  try {
    const { supabase, user } = await currentUser();
    if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });

    const { error } = await supabase.from("planner").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Planner delete error:", error);
    return NextResponse.json({ ok: false, error: "Could not delete the session." }, { status: 500 });
  }
}
