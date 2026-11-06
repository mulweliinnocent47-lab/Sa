import { createClient } from "@/utils/supabase/server";
import { configurePush, sendPush } from "@/lib/pushServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST -> sends a test notification to the signed-in user's own devices
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "Not signed in." }, { status: 401 });
  if (!configurePush()) return Response.json({ ok: false, error: "Push keys are not set on the server yet (see README)." }, { status: 503 });

  const { data: subs } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth").eq("user_id", user.id);
  if (!subs?.length) return Response.json({ ok: false, error: "No device is subscribed yet." }, { status: 404 });

  const results = await Promise.all(subs.map((s) =>
    sendPush(s, { title: "Notifications are on ✅", body: "You'll get your daily study nudge from SA Student.", url: "/leaderboard", tag: "test" })
  ));
  return Response.json({ ok: results.some((r) => r.ok), sent: results.filter((r) => r.ok).length });
}
