import Link from "next/link";
import { Clock, Flame, Target, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, PageHeader, ProgressBar, SectionTitle, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/authServer";
import { computeStreak, dayKey, dayStart, weekStart } from "@/lib/tasksConfig";
import { getActivityDates, getPracticeResults } from "@/lib/xpServer";

export const metadata = { title: "Progress — SA Student" };
export const dynamic = "force-dynamic";

const RANGES = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];
const TONES = ["primary", "cyan", "success", "gold"];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 86_400_000;

function monthStart(now = new Date()) {
  const [y, m] = dayKey(now).split("-");
  return new Date(`${y}-${m}-01T00:00:00+02:00`);
}

function sinceFor(range) {
  if (range === "week") return weekStart();
  if (range === "month") return monthStart();
  return null;
}

/** Minutes practised per bar: days of this week / weeks of this month / last 6 months */
function buildBars(range, results) {
  const minutes = (r) => (r.seconds_used ?? 0) / 60;

  if (range === "week") {
    const start = weekStart().getTime();
    const bars = DAY_NAMES.map((d) => ({ label: d, value: 0 }));
    for (const r of results) {
      const i = Math.floor((new Date(r.created_at).getTime() - start) / DAY_MS);
      if (i >= 0 && i < 7) bars[i].value += minutes(r);
    }
    return bars;
  }

  if (range === "month") {
    const start = monthStart().getTime();
    const bars = [1, 2, 3, 4, 5].map((n) => ({ label: `Wk ${n}`, value: 0 }));
    for (const r of results) {
      const i = Math.min(4, Math.floor((new Date(r.created_at).getTime() - start) / (7 * DAY_MS)));
      if (i >= 0) bars[i].value += minutes(r);
    }
    return bars;
  }

  const now = new Date(Date.now() + 2 * 3600_000); // SA time
  const bars = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - k, 1));
    bars.push({ label: MONTH_NAMES[d.getUTCMonth()], key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, value: 0 });
  }
  for (const r of results) {
    const d = new Date(new Date(r.created_at).getTime() + 2 * 3600_000);
    const bar = bars.find((b) => b.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (bar) bar.value += minutes(r);
  }
  return bars;
}

function ago(iso) {
  const days = Math.round((dayStart().getTime() - dayStart(new Date(iso)).getTime()) / DAY_MS);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default async function ProgressPage({ searchParams }) {
  const sp = await Promise.resolve(searchParams);
  const range = RANGES.some((r) => r.id === sp?.range) ? sp.range : "week";

  const { supabase, user } = await getCurrentUser();

  const header = <PageHeader title="Progress" subtitle="See how much you've studied and where to focus next." />;

  if (!user) {
    return (
      <AppShell>
        {header}
        <Card className="mx-auto max-w-md text-center">
          <Trophy className="mx-auto size-6 text-gold" />
          <h2 className="mt-3 text-lg font-bold">Track your progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create a free account and your practice scores, study time and streak will show up here.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/signup?next=/progress" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Sign up</Link>
            <Link href="/login?next=/progress" className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium">Log in</Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  const since = sinceFor(range);
  const [results, dates] = await Promise.all([
    getPracticeResults(supabase, user.id, since ? since.toISOString() : null),
    getActivityDates(supabase, user.id),
  ]);

  if (results === null) {
    return (
      <AppShell>
        {header}
        <Card className="text-center text-sm text-muted-foreground">Progress is being set up. Please check back soon.</Card>
      </AppShell>
    );
  }

  const sessions = results.length;
  const avg = sessions ? Math.round(results.reduce((s, r) => s + r.percent, 0) / sessions) : 0;
  const totalSeconds = results.reduce((s, r) => s + (r.seconds_used ?? 0), 0);
  const studyTime = totalSeconds >= 3600 ? `${(totalSeconds / 3600).toFixed(1)} h` : `${Math.round(totalSeconds / 60)} min`;
  const streak = computeStreak(dates);

  const bars = buildBars(range, results);
  const max = Math.max(1, ...bars.map((b) => b.value));

  const bySubject = new Map();
  for (const r of results) {
    const key = r.subject || "Other";
    const row = bySubject.get(key) ?? { subject: key, total: 0, n: 0 };
    row.total += r.percent;
    row.n += 1;
    bySubject.set(key, row);
  }
  const mastery = [...bySubject.values()]
    .map((m) => ({ subject: m.subject, pct: Math.round(m.total / m.n), n: m.n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  return (
    <AppShell>
      {header}

      <div className="inline-flex rounded-full border border-border bg-muted p-1">
        {RANGES.map((r) => (
          <Link
            key={r.id}
            href={`/progress?range=${r.id}`}
            replace
            aria-current={range === r.id ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${range === r.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Flame} label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} tone="gold" />
        <Stat icon={Clock} label="Study time" value={studyTime} />
        <Stat icon={Target} label="Avg score" value={sessions ? `${avg}%` : "—"} tone="success" />
        <Stat icon={Trophy} label="Sessions" value={sessions} tone="gold" />
      </div>

      {sessions === 0 ? (
        <Card className="mt-8 text-center">
          <p className="font-semibold">No practice sessions {range === "all" ? "yet" : "in this period"}.</p>
          <p className="mt-1 text-sm text-muted-foreground">Finish a session in the Exam Centre and your progress will appear here.</p>
          <Link href="/exam-centre" className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Go to Exam Centre</Link>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <p className="font-semibold">Minutes practised</p>
              <div className="mt-6 flex h-48 items-end gap-2 md:gap-4">
                {bars.map((x) => (
                  <div key={x.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{Math.round(x.value)}</span>
                    <div className="w-full rounded-t-lg bg-hero" style={{ height: `${(x.value / max) * 100}%`, minHeight: 4 }} />
                    <span className="text-xs text-muted-foreground">{x.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <p className="font-semibold">Subject mastery</p>
              <div className="mt-4 space-y-5">
                {mastery.map((m, i) => (
                  <div key={m.subject}>
                    <div className="mb-1.5 flex justify-between text-sm"><span className="truncate pr-2">{m.subject}</span><span className="font-semibold">{m.pct}%</span></div>
                    <ProgressBar value={m.pct} tone={TONES[i % TONES.length]} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <section className="mt-8">
            <SectionTitle title="Recent activity" />
            <div className="space-y-2">
              {results.slice(0, 8).map((r, i) => (
                <Card key={`${r.created_at}-${i}`} className="flex items-center justify-between gap-3 !p-4">
                  <p className="min-w-0 truncate text-sm font-medium">Finished {r.title || r.session_id}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">{r.score}/{r.total_marks} · {r.percent}% · {ago(r.created_at)}</p>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
