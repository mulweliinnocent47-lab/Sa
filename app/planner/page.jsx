import { CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PlannerForm } from "@/components/PlannerForm";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui";
import Calendar from "@/components/calendar;

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
      <PageHeader title="Planner" subtitle="Plan your week and tick sessions off as you go.You'll find every session on the exam centre page." />
       

      {/* NEW: add-session form + 3 random suggestions */}
      <PlannerForm />

      <div className="grid gap-6 lg:grid-cols-3">
        <Calendar />

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
