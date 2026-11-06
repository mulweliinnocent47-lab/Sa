import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Download, FileText, MessageSquareText, Sparkles, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/ui";
import { getCurrentUser } from "@/lib/authServer";
import { getCountdown } from "@/lib/exam-timetable";
import { GetPapers } from "@/lib/paperServer.js";
import { getNotes } from "@/lib/notesHelper.js";
import { evaluateTasks, levelProgress } from "@/lib/tasksConfig";
import { getMyXp, getWeekEvents } from "@/lib/xpServer";

export const metadata = {
  title: "SA Student — NSC past papers, notes & AI practice",
  description: "Track your exam countdown, open NSC past papers and notes, and brainstorm with an AI study partner built for South African high schoolers.",
};
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { supabase, user } = await getCurrentUser();

  // Everything loads at the same time instead of one thing after another.
  const [NOTES, PAPERS, downloads, xp, events] = await Promise.all([
    getNotes(),
    GetPapers(),
    user ? supabase.from("downloads").select("*", { count: "exact", head: true }).eq("user_id", user.id) : null,
    user ? getMyXp(supabase, user.id) : null,
    user ? getWeekEvents(supabase, user.id) : null,
  ]);

  const countdown = getCountdown();
  const recent = (PAPERS ?? []).slice(0, 3);
  const notes = [...(NOTES ?? [])].sort(() => Math.random() - 0.5).slice(0, 2);

  const dailyTasks = events ? evaluateTasks(events).filter((t) => t.period === "daily") : null;
  const dailyDone = dailyTasks?.filter((t) => t.done).length ?? 0;
  const lvl = xp ? levelProgress(xp.total) : null;

  const headline =
    countdown.state === "before" ? `Matric finals in ${countdown.big} ${countdown.unit}`
    : countdown.state === "today" ? "Exam day: good luck!"
    : countdown.state === "during" ? `Next exam day in ${countdown.big} ${countdown.unit}`
    : "The finals are done. Well done!";

  return (
    <AppShell>
      <section className="overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-float md:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
          <CalendarDays className="size-3.5" /> NSC finals · 2026
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">{headline}</h1>
        <p className="mt-3 max-w-xl text-sm text-primary-foreground/85 md:text-base">
          {countdown.state === "before" && Number(countdown.big) >= 7
            ? `That's roughly ${Math.floor(Number(countdown.big) / 7)} weekends left. `
            : ""}
          Start today with one paper, one set of notes, and ten minutes with your AI study partner.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/practice" className="inline-flex h-11 items-center gap-2 rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
            <MessageSquareText className="size-4" /> Brainstorm with Practice AI
          </Link>
          <Link href="/papers" className="inline-flex h-11 items-center gap-2 rounded-lg border border-primary-foreground/40 bg-transparent px-4 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/15">
            Browse papers <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><Download className="size-4 text-primary" /> Your downloads</div>
          {user ? (
            <>
              <p className="mt-3 text-3xl font-bold">{downloads?.count ?? 0}</p>
              <p className="mt-1 text-xs text-muted-foreground">Papers and notes are free to download.</p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">Everything is free. Sign up to download papers and notes.</p>
              <Link href="/signup" className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">Create free account</Link>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><Trophy className="size-4 text-gold" /> XP and level</div>
          {user && lvl ? (
            <>
              <p className="mt-3 text-3xl font-bold">{xp.total} <span className="text-sm font-medium text-muted-foreground">XP · Level {lvl.level}</span></p>
              <div className="mt-3"><ProgressBar value={lvl.pct} tone="gold" /></div>
              <Link href="/leaderboard" className="mt-3 inline-block text-sm font-medium text-primary">See the leaderboard</Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">Earn XP for practising and planning, and climb the leaderboard.</p>
              <Link href="/leaderboard" className="mt-4 inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">View leaderboard</Link>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-gold-soft p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="size-4 text-gold" /> Today's tasks</div>
          {dailyTasks ? (
            <>
              <p className="mt-3 text-3xl font-bold">{dailyDone}<span className="text-sm font-medium text-muted-foreground"> of {dailyTasks.length} done</span></p>
              <div className="mt-3"><ProgressBar value={(dailyDone / dailyTasks.length) * 100} tone="success" /></div>
              <Link href="/leaderboard" className="mt-3 inline-block text-sm font-medium text-primary">See my tasks</Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Sign up to get daily and weekly tasks that earn XP.</p>
          )}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mt-8">
          <div className="flex items-end justify-between"><h2 className="text-lg font-bold tracking-tight">Pick up where you left off</h2><Link href="/papers" className="text-sm font-medium text-primary">All papers</Link></div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {recent.map((p) => (
              <Link key={p.id} href="/papers" className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-soft">
                <FileText className="size-5 text-primary" />
                <p className="mt-3 line-clamp-2 font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.subject} · Grade {p.grade}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-end justify-between"><h2 className="text-lg font-bold tracking-tight">Short notes for tonight</h2><Link href="/notes" className="text-sm font-medium text-primary">All notes</Link></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {notes.map((n) => (
              <Link key={n.slug} href={`/notes/${encodeURIComponent(n.slug)}`} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-soft">
                <BookOpen className="size-5 text-cyan" />
                <p className="mt-3 font-semibold">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.summary}</p>
                <p className="mt-3 text-xs text-muted-foreground">{n.minutes} min read</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
