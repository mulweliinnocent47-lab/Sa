import { getAdmin } from "@/lib/supabaseAdmin";
import { configurePush, sendPush } from "@/lib/pushServer";
import { dayKey } from "@/lib/tasksConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron calls this every day (see vercel.json) and sends "Authorization: Bearer <CRON_SECRET>".
// You can also test it by hand:  curl -H "Authorization: Bearer YOUR_SECRET" https://your-site/api/push/send
async function run(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ ok: false, error: "CRON_SECRET is not set." }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!configurePush()) return Response.json({ ok: false, error: "VAPID keys are not set." }, { status: 500 });

  const admin = getAdmin();
  if (!admin) return Response.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is not set." }, { status: 500 });

  const { data: subs, error } = await admin
    .from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth, pref_daily, pref_weekly").limit(5000);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  if (!subs?.length) return Response.json({ ok: true, sent: 0, removed: 0 });

  // How many planned sessions is each student still to do?
  const pending = new Map();
  const { data: plans } = await admin.from("planner").select("user_id").eq("done", false).limit(20000);
  for (const p of plans ?? []) pending.set(p.user_id, (pending.get(p.user_id) ?? 0) + 1);

  const isSunday = new Date(`${dayKey()}T12:00:00Z`).getUTCDay() === 0;

  const messages = subs.map((s) => {
    if (isSunday && s.pref_weekly) {
      return [s, { title: "Your week in review 📈", body: "Check your progress and finish your weekly tasks before they reset tomorrow.", url: "/progress", tag: "weekly" }];
    }
    if (!s.pref_daily) return [s, null];
    const n = pending.get(s.user_id) ?? 0;
    return [s, n > 0
      ? { title: "Time to study 📚", body: `You have ${n} planned session${n === 1 ? "" : "s"} waiting. Finish one to earn XP.`, url: "/exam-centre", tag: "daily" }
      : { title: "Today's tasks are live ⭐", body: "Complete your daily tasks and climb the leaderboard.", url: "/leaderboard", tag: "daily" }];
  }).filter(([, payload]) => payload);

  let sent = 0;
  const gone = [];
  for (let i = 0; i < messages.length; i += 25) {
    const batch = messages.slice(i, i + 25);
    const results = await Promise.all(batch.map(([s, payload]) => sendPush(s, payload)));
    results.forEach((r, j) => {
      if (r.ok) sent++;
      else if (r.gone) gone.push(batch[j][0].id);
    });
  }
  if (gone.length) await admin.from("push_subscriptions").delete().in("id", gone);

  return Response.json({ ok: true, sent, removed: gone.length });
}

export const GET = run;
export const POST = run;
