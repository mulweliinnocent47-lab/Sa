import { Clock, Flame, Target, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, Chip, ChipRow, PageHeader, ProgressBar, SectionTitle, Stat } from "@/components/ui";

export const metadata = { title: "Progress — SA Student" };

// ── PLACEHOLDER DATA ── wire to activity + scores
const RANGE = ["This week", "This month", "All time"];
const HOURS = [
  { d: "Mon", h: 1.5 }, { d: "Tue", h: 2.5 }, { d: "Wed", h: 0.5 }, { d: "Thu", h: 3 },
  { d: "Fri", h: 2 }, { d: "Sat", h: 4 }, { d: "Sun", h: 1 },
];
const MASTERY = [
  { subject: "Mathematics", pct: 62, tone: "primary" },
  { subject: "Physical Sciences", pct: 45, tone: "cyan" },
  { subject: "Life Sciences", pct: 71, tone: "success" },
  { subject: "English HL", pct: 80, tone: "gold" },
];
const ACTIVITY = [
  { t: "Finished Maths quick-fire", s: "8/10 · Today" },
  { t: "Read Algebra summary", s: "Yesterday" },
  { t: "Mock exam: Physical Sciences", s: "58% · 2 days ago" },
];

export default function ProgressPage() {
  const max = Math.max(...HOURS.map((x) => x.h));
  return (
    <AppShell>
      <PageHeader title="Progress" subtitle="See how much you've studied and where to focus next." />
      <ChipRow>{RANGE.map((r, i) => <Chip key={r} active={i === 0}>{r}</Chip>)}</ChipRow>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Flame} label="Streak" value="6 days" tone="gold" />
        <Stat icon={Clock} label="Study time" value="14.5 h" />
        <Stat icon={Target} label="Avg score" value="68%" tone="success" />
        <Stat icon={Trophy} label="Sessions" value="14" tone="gold" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="font-semibold">Hours studied</p>
          <div className="mt-6 flex h-48 items-end gap-2 md:gap-4">
            {HOURS.map((x) => (
              <div key={x.d} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-medium text-muted-foreground">{x.h}</span>
                <div className="w-full rounded-t-lg bg-hero" style={{ height: `${(x.h / max) * 100}%`, minHeight: 4 }} />
                <span className="text-xs text-muted-foreground">{x.d}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="font-semibold">Subject mastery</p>
          <div className="mt-4 space-y-5">
            {MASTERY.map((m) => (
              <div key={m.subject}>
                <div className="mb-1.5 flex justify-between text-sm"><span>{m.subject}</span><span className="font-semibold">{m.pct}%</span></div>
                <ProgressBar value={m.pct} tone={m.tone} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section className="mt-8">
        <SectionTitle title="Recent activity" />
        <div className="space-y-2">
          {ACTIVITY.map((a) => (
            <Card key={a.t} className="flex items-center justify-between !p-4">
              <p className="text-sm font-medium">{a.t}</p>
              <p className="text-xs text-muted-foreground">{a.s}</p>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
