import Link from "next/link";
import { CalendarDays, Clock, PlayCircle, Timer, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, PageHeader, PrimaryButton, SectionTitle, Stat } from "@/components/ui";

export const metadata = { title: "Exam Centre — SA Student" };

// ── PLACEHOLDER DATA ── exam dates + practice sessions
const COUNTDOWN = { days: 10, label: "until your first exam" };
const TIMETABLE = [
  { date: "19 Oct", day: "Mon", subject: "English HL — Paper 1", time: "09:00", length: "2 hrs" },
  { date: "21 Oct", day: "Wed", subject: "Mathematics — Paper 1", time: "09:00", length: "3 hrs" },
  { date: "26 Oct", day: "Mon", subject: "Life Sciences — Paper 1", time: "09:00", length: "2.5 hrs" },
];
const SESSIONS = [
  { id: "maths-quick-10", title: "Mathematics quick-fire", kind: "10 questions", minutes: 15, level: "Mixed" },
  { id: "physics-mock-1", title: "Physical Sciences mock exam", kind: "Full paper", minutes: 180, level: "Hard" },
  { id: "lifesci-topic-test", title: "Life Sciences topic test", kind: "20 questions", minutes: 30, level: "Medium" },
];
const LEVEL_TONE = { Mixed: "brand", Hard: "danger", Medium: "gold" };

export default function ExamCentrePage() {
  return (
    <AppShell>
      <PageHeader title="Exam Centre" subtitle="Know when your exams are and practise under real conditions." />

      <section className="overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-float md:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
          <CalendarDays className="size-3.5" /> NSC finals
        </span>
        <p className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">{COUNTDOWN.days}<span className="ml-2 text-xl font-semibold">days</span></p>
        <p className="mt-1 text-sm text-primary-foreground/85">{COUNTDOWN.label}</p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={Trophy} label="Best score" value="82%" tone="gold" />
        <Stat icon={PlayCircle} label="Sessions done" value="14" />
        <Stat icon={Timer} label="Time practised" value="9h 20m" tone="success" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <SectionTitle title="Exam timetable" />
          <div className="space-y-3">
            {TIMETABLE.map((e) => (
              <Card key={e.date} className="flex items-center gap-4 !p-4">
                <div className="w-14 shrink-0 rounded-xl bg-brand-soft py-2 text-center text-primary">
                  <p className="text-[11px] font-semibold uppercase">{e.day}</p>
                  <p className="text-sm font-bold">{e.date}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{e.subject}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> {e.time} · {e.length}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="Practice sessions" />
          <div className="space-y-3">
            {SESSIONS.map((s) => (
              <Card key={s.id} className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.kind} · {s.minutes} min</p>
                  </div>
                  <Badge tone={LEVEL_TONE[s.level]}>{s.level}</Badge>
                </div>
                <PrimaryButton href={`/practice/${s.id}`} icon={PlayCircle} className="mt-4 w-full">Start session</PrimaryButton>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
