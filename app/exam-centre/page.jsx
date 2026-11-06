import { CalendarDays, PlayCircle, Timer, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ExamCentreLists } from "@/components/ExamCentreLists";
import { PageHeader, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/authServer";
import { getCountdown, upcomingExams } from "@/lib/exam-timetable";
import { SESSIONS } from "@/lib/practice-sessions";
import { getPlannedSessions } from "@/lib/plannerAPIFetch";
import { getPracticeResults } from "@/lib/xpServer";

export const metadata = { title: "Exam Centre — SA Student" };
export const dynamic = "force-dynamic";

function formatTime(seconds) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

export default async function ExamCentrePage() {
  const { supabase, user } = await getCurrentUser();

  // both queries run at the same time
  const [planned, results] = await Promise.all([
    getPlannedSessions({ pendingOnly: true }),
    user ? getPracticeResults(supabase, user.id) : null,
  ]);

  // planned sessions first, then the built-in ones (new array: SESSIONS is never changed)
  const sessions = [...planned, ...SESSIONS];
  const countdown = getCountdown();

  const hasStats = !!results;
  const best = hasStats ? results.reduce((m, r) => Math.max(m, r.percent), 0) : 0;
  const seconds = hasStats ? results.reduce((s, r) => s + (r.seconds_used ?? 0), 0) : 0;

  return (
    <AppShell>
      <PageHeader title="Exam Centre" subtitle="Know when your exams are and practise under real conditions." />

      <section className="overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-float md:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
          <CalendarDays className="size-3.5" /> NSC finals
        </span>
        <p className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
          {countdown.big}
          {countdown.unit && <span className="ml-2 text-xl font-semibold">{countdown.unit}</span>}
        </p>
        <p className="mt-1 text-sm text-primary-foreground/85">{countdown.label}</p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={Trophy} label="Best score" value={hasStats && results.length ? `${best}%` : "—"} tone="gold" />
        <Stat icon={PlayCircle} label="Sessions done" value={hasStats ? results.length : "—"} hint={user ? undefined : "Sign up to track"} />
        <Stat icon={Timer} label="Time practised" value={hasStats ? formatTime(seconds) : "—"} tone="success" />
      </div>

      <ExamCentreLists timetable={upcomingExams()} sessions={sessions} />
    </AppShell>
  );
}
