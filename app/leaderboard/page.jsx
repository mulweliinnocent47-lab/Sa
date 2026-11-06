import Link from "next/link";
import { CheckCircle2, Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, PageHeader, ProgressBar, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/authServer";
import { getOrCreateProfile } from "@/lib/profileServer";
import { getLeaderboard, getMyXp, getWeekEvents } from "@/lib/xpServer";
import { evaluateTasks, levelProgress } from "@/lib/tasksConfig";

export const metadata = { title: "Leaderboard — SA Student" };
export const dynamic = "force-dynamic";

const PERIODS = [
  { id: "week", label: "This week" },
  { id: "all", label: "All time" },
];

function RankMark({ rank }) {
  if (rank === 1) return <Crown className="size-5 text-gold" aria-label="1st" />;
  if (rank === 2) return <Medal className="size-5 text-muted-foreground" aria-label="2nd" />;
  if (rank === 3) return <Medal className="size-5 text-[oklch(0.65_0.12_55)]" aria-label="3rd" />;
  return <span className="text-sm font-semibold text-muted-foreground">{rank}</span>;
}

function TaskCard({ task }) {
  const pct = Math.round((task.progress / task.target) * 100);
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-semibold leading-snug ${task.done ? "text-muted-foreground line-through" : ""}`}>{task.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{task.progress}/{task.target}</p>
        </div>
        {task.done ? (
          <Badge tone="success"><CheckCircle2 className="size-3" /> +{task.xp} XP</Badge>
        ) : (
          <Badge tone="gold">+{task.xp} XP</Badge>
        )}
      </div>
      <div className="mt-3"><ProgressBar value={pct} tone={task.done ? "success" : "primary"} /></div>
      {!task.done && task.href && (
        <Link href={task.href} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Do it now</Link>
      )}
    </Card>
  );
}

export default async function LeaderboardPage({ searchParams }) {
  const sp = await Promise.resolve(searchParams);
  const period = sp?.period === "all" ? "all" : "week";

  const { supabase, user } = await getCurrentUser();

  const [rows, mine, events, profile] = await Promise.all([
    getLeaderboard(supabase, period),
    user ? getMyXp(supabase, user.id) : null,
    user ? getWeekEvents(supabase, user.id) : null,
    user ? getOrCreateProfile(supabase, user) : null,
  ]);

  const tasks = user && events ? evaluateTasks(events) : null;
  const myRow = rows?.find((r) => r.user_id === user?.id);
  const lvl = mine ? levelProgress(mine.total) : null;

  return (
    <AppShell>
      <PageHeader
        title="Leaderboard"
        subtitle="Earn XP by finishing daily and weekly tasks. Practise, plan and climb the ranks."
      />

      <div className="mb-5 inline-flex rounded-full border border-border bg-muted p-1">
        {PERIODS.map((p) => (
          <Link
            key={p.id}
            href={`/leaderboard?period=${p.id}`}
            replace
            aria-current={period === p.id ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${period === p.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── RANKING ── */}
        <section className="lg:col-span-2">
          {rows === null ? (
            <Card className="text-center text-sm text-muted-foreground">
              <Trophy className="mx-auto mb-2 size-6 text-gold" />
              The leaderboard is being set up. Please check back soon.
            </Card>
          ) : rows.length === 0 ? (
            <Card className="text-center">
              <Trophy className="mx-auto mb-2 size-6 text-gold" />
              <p className="font-semibold">No one has earned XP {period === "week" ? "this week" : "yet"}.</p>
              <p className="mt-1 text-sm text-muted-foreground">Finish a task below and you could be #1.</p>
            </Card>
          ) : (
            <ol className="space-y-2">
              {rows.map((r) => {
                const me = r.user_id === user?.id;
                return (
                  <li
                    key={r.user_id}
                    className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm ${me ? "border-primary bg-brand-soft" : "border-border bg-card"}`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center"><RankMark rank={Number(r.rank)} /></span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-hero text-sm font-bold uppercase text-primary-foreground">
                      {r.username.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.username}{me && <span className="ml-2 text-xs font-medium text-primary">You</span>}</p>
                      <p className="text-xs text-muted-foreground">{r.grade ? `Grade ${r.grade} · ` : ""}Level {levelProgress(Number(r.xp)).level}</p>
                    </div>
                    <p className="text-sm font-bold">{Number(r.xp).toLocaleString("en-ZA")} <span className="text-xs font-medium text-muted-foreground">XP</span></p>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* ── YOU + TASKS ── */}
        <aside className="space-y-6">
          {user ? (
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{profile?.username ?? "You"}</p>
              {mine ? (
                <>
                  <p className="mt-1 text-3xl font-bold">{mine.total.toLocaleString("en-ZA")} <span className="text-sm font-medium text-muted-foreground">XP</span></p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {mine.week} XP this week{myRow ? ` · rank #${myRow.rank}` : ""}
                  </p>
                  <div className="mt-4 flex justify-between text-xs font-medium"><span>Level {lvl.level}</span><span className="text-muted-foreground">{lvl.into}/{lvl.need} XP to level {lvl.level + 1}</span></div>
                  <div className="mt-1.5"><ProgressBar value={lvl.pct} tone="gold" /></div>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Your XP will show here once the database is set up.</p>
              )}
            </Card>
          ) : (
            <Card className="bg-gold-soft">
              <Sparkles className="size-5 text-gold" />
              <p className="mt-2 font-semibold">Join the leaderboard</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a free account to earn XP for your practice and planning.</p>
              <div className="mt-4 flex gap-2">
                <Link href="/signup?next=/leaderboard" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Sign up</Link>
                <Link href="/login?next=/leaderboard" className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium">Log in</Link>
              </div>
            </Card>
          )}
        </aside>
      </div>

      {/* ── TASKS ── */}
      {tasks && (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <SectionTitle title="Daily tasks" />
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">Reset at midnight (South Africa time).</p>
            <div className="space-y-3">{tasks.filter((t) => t.period === "daily").map((t) => <TaskCard key={t.key} task={t} />)}</div>
          </section>
          <section>
            <SectionTitle title="Weekly tasks" />
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">Reset every Monday.</p>
            <div className="space-y-3">{tasks.filter((t) => t.period === "weekly").map((t) => <TaskCard key={t.key} task={t} />)}</div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
