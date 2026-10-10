import { CalendarDays, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, GhostButton, PageHeader, PrimaryButton, SectionTitle } from "@/components/ui";

export const metadata = { title: "Planner — SA Student" };

// ── PLACEHOLDER DATA ── wire to saved study sessions
const WEEK = [
  { day: "Mon", date: 5, sessions: [{ t: "Maths · Algebra", time: "16:00", tone: "brand" }] },
  { day: "Tue", date: 6, sessions: [{ t: "Life Sci · Cells", time: "15:30", tone: "success" }, { t: "English essay", time: "18:00", tone: "gold" }] },
  { day: "Wed", date: 7, sessions: [] },
  { day: "Thu", date: 8, sessions: [{ t: "Physics · Forces", time: "16:00", tone: "brand" }] },
  { day: "Fri", date: 9, today: true, sessions: [{ t: "Maths paper 1", time: "14:00", tone: "brand" }] },
  { day: "Sat", date: 10, sessions: [{ t: "History · Cold War", time: "10:00", tone: "gold" }] },
  { day: "Sun", date: 11, sessions: [] },
];
const TODAY = [
  { t: "Maths paper 1 — Section A", time: "14:00 · 45 min", done: true },
  { t: "Review memo and mark yourself", time: "15:00 · 20 min", done: false },
  { t: "Ask AI Tutor about Q4", time: "15:30 · 10 min", done: false },
];
const DOT = { brand: "bg-primary", success: "bg-success", gold: "bg-gold" };

export default function PlannerPage() {
  return (
    <AppShell>
      <PageHeader title="Planner" subtitle="Plan your week and tick sessions off as you go."
        action={<PrimaryButton icon={Plus}>Add session</PrimaryButton>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold"><CalendarDays className="size-4 text-primary" /> 5 – 11 October</p>
            <div className="flex gap-1">
              <button type="button" aria-label="Previous week" className="grid size-9 place-items-center rounded-lg border border-border hover:bg-muted"><ChevronLeft className="size-4" /></button>
              <button type="button" aria-label="Next week" className="grid size-9 place-items-center rounded-lg border border-border hover:bg-muted"><ChevronRight className="size-4" /></button>
            </div>
          </div>

          {/* Mobile: list · Desktop: 7-column grid */}
          <div className="grid gap-3 md:grid-cols-7">
            {WEEK.map((d) => (
              <Card key={d.day} className={`!p-3 md:min-h-40 ${d.today ? "!border-primary ring-2 ring-primary/20" : ""}`}>
                <div className="flex items-baseline justify-between md:block">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{d.day}</p>
                  <p className={`text-lg font-bold ${d.today ? "text-primary" : ""}`}>{d.date}</p>
                </div>
                <div className="mt-2 space-y-1.5">
                  {d.sessions.length === 0 && <p className="text-xs text-muted-foreground">Free</p>}
                  {d.sessions.map((s) => (
                    <div key={s.t} className="rounded-lg bg-muted p-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold"><span className={`size-1.5 rounded-full ${DOT[s.tone]}`} /> <span className="truncate">{s.t}</span></p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{s.time}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <aside>
          <SectionTitle title="Today" />
          <div className="space-y-3">
            {TODAY.map((t) => (
              <Card key={t.t} className="flex items-start gap-3 !p-4">
                <button type="button" aria-label="Toggle done" className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${t.done ? "border-success bg-success text-white" : "border-input"}`}>
                  {t.done && <Check className="size-3.5" />}
                </button>
                <div>
                  <p className={`text-sm font-semibold ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.t}</p>
                  <p className="text-xs text-muted-foreground">{t.time}</p>
                </div>
              </Card>
            ))}
          </div>
          <Card className="mt-4">
            <Badge tone="gold">Tip</Badge>
            <p className="mt-2 text-sm text-muted-foreground">Short, daily sessions beat one long cram. Aim for 3 per day.</p>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
