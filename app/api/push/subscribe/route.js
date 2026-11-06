import { createClient } from "@/utils/supabase/server";
import { getAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// POST  { subscription }  -> saves this device for the signed-in user
export async function POST(request) {
  const { supabase, user } = await currentUser();
  if (!user) return Response.json({ ok: false, error: "Please sign in to turn on notifications." }, { status: 401 });

  const { subscription } = await request.json().catch(() => ({}));
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;
  if (!endpoint || !p256dh || !auth) return Response.json({ ok: false, error: "Invalid subscription." }, { status: 400 });

  // The admin client lets a phone move from one account to another cleanly.
  const db = getAdmin() ?? supabase;
  const { error } = await db.from("push_subscriptions").upsert(
    {
      user_id: user.id, endpoint, p256dh, auth,
      user_agent: (request.headers.get("user-agent") ?? "").slice(0, 200),
    },
    { onConflict: "endpoint" }
  );
  if (error) {
    console.error("push subscribe:", error.message);
    return Response.json({ ok: false, error: "Could not save the subscription." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

// GET ?endpoint=...  -> { subscribed, pref_daily, pref_weekly }
export async function GET(request) {
  const { supabase, user } = await currentUser();
  if (!user) return Response.json({ subscribed: false });
  const endpoint = new URL(request.url).searchParams.get("endpoint");
  if (!endpoint) return Response.json({ subscribed: false });

  const { data } = await supabase
    .from("push_subscriptions").select("pref_daily, pref_weekly")
    .eq("user_id", user.id).eq("endpoint", endpoint).maybeSingle();
  return Response.json(data ? { subscribed: true, ...data } : { subscribed: false });
}

// PATCH { endpoint, pref_daily?, pref_weekly? }
export async function PATCH(request) {
  const { supabase, user } = await currentUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const b = await request.json().catch(() => ({}));
  const update = {};
  if (typeof b.pref_daily === "boolean") update.pref_daily = b.pref_daily;
  if (typeof b.pref_weekly === "boolean") update.pref_weekly = b.pref_weekly;
  if (!b.endpoint || !Object.keys(update).length) return Response.json({ ok: false }, { status: 400 });

  const { error } = await supabase.from("push_subscriptions").update(update).eq("user_id", user.id).eq("endpoint", b.endpoint);
  return Response.json({ ok: !error }, { status: error ? 500 : 200 });
}

// DELETE { endpoint }
export async function DELETE(request) {
  const { supabase, user } = await currentUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });
  const { endpoint } = await request.json().catch(() => ({}));
  if (!endpoint) return Response.json({ ok: false }, { status: 400 });
  const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  return Response.json({ ok: !error }, { status: error ? 500 : 200 });
}
