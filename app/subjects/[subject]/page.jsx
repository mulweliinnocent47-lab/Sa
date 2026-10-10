import Link from "next/link";
import { BookOpen, ClipboardCheck, FileText, Target, Check, Circle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, Chip, ChipRow, PageHeader, PrimaryButton, GhostButton, ProgressBar, SectionTitle, Stat, titleCase } from "@/components/ui";

export const metadata = { title: "Subject — SA Student" };

// ── PLACEHOLDER DATA ── load by `subject` slug
const STATS = { papers: 24, notes: 18, average: "68%" };
const TABS = ["Overview", "Topics", "Notes", "Papers"];
const TOPICS = [
  { name: "Algebra and equations", lessons: 8, done: 8 },
  { name: "Functions and graphs", lessons: 10, done: 6 },
  { name: "Trigonometry", lessons: 9, done: 3 },
  { name: "Finance and growth", lessons: 6, done: 0 },
  { name: "Probability", lessons: 7, done: 0 },
];

export default async function SubjectPage({ params }) {
  const { subject } = await Promise.resolve(params);
  const name = titleCase(subject);
  return (
    <AppShell>
      <PageHeader
        back={{ href: "/subjects", label: "All subjects" }}
        title={name}
        subtitle="Overview of topics, resources and your progress in this subject."
        action={<PrimaryButton href="/exam-centre" icon={ClipboardCheck}>Start practice</PrimaryButton>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={FileText} label="Past papers" value={STATS.papers} />
        <Stat icon={BookOpen} label="Notes" value={STATS.notes} tone="success" />
        <Stat icon={Target} label="Your average" value={STATS.average} tone="gold" />
      </div>

      <div className="mt-6"><ChipRow>{TABS.map((t, i) => <Chip key={t} active={i === 0}>{t}</Chip>)}</ChipRow></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionTitle title="Topics" />
          <div className="space-y-3">
            {TOPICS.map((t) => {
              const pct = Math.round((t.done / t.lessons) * 100);
              return (
                <Card key={t.name} className="flex items-center gap-4 !p-4">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${pct === 100 ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}>
                    {pct === 100 ? <Check className="size-4" /> : <Circle className="size-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.done}/{t.lessons} lessons</p>
                    <div className="mt-2"><ProgressBar value={pct} tone={pct === 100 ? "success" : "primary"} /></div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <Badge tone="gold">Up next</Badge>
            <p className="mt-3 font-semibold">Trigonometry — identities</p>
            <p className="mt-1 text-xs text-muted-foreground">12 min read · 5 practice questions</p>
            <PrimaryButton href="/resources/sample-resource" className="mt-4 w-full">Continue</PrimaryButton>
          </Card>
          <Card>
            <p className="text-sm font-semibold">Quick links</p>
            <div className="mt-3 flex flex-col gap-2">
              <GhostButton href="/resources" icon={BookOpen}>Notes & papers</GhostButton>
              <GhostButton href="/ai-tutor">Ask the AI Tutor</GhostButton>
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
