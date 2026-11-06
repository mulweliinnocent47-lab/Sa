import { createClient } from "@/utils/supabase/server";
import { recordEvent } from "@/lib/xpServer";

export const dynamic = "force-dynamic";

// POST /api/activity  body: { type: "ai_message" }
// Called by the AI chat / Test yourself after the AI really answered.
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (body?.type !== "ai_message") {
    return Response.json({ ok: false, error: "Unknown activity" }, { status: 400 });
  }
  return Response.json(await recordEvent(user, "ai_message", {}, { dailyCap: 60 }));
}
