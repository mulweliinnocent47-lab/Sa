import { ChevronLeft, ChevronRight, Flag, Timer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, GhostButton, PageHeader, PrimaryButton, ProgressBar, titleCase } from "@/components/ui";

export const metadata = { title: "Practice — SA Student" };

// ── PLACEHOLDER DATA ── load session by `id`
const TOTAL = 10;
const CURRENT = 3;
const TIME_LEFT = "12:45";
const QUESTION = {
  marks: 2,
  text: "Question text goes here. For example: Solve for x: 2x² − 5x − 3 = 0.",
  options: ["x = 3 or x = −½", "x = −3 or x = ½", "x = 3 or x = ½", "x = −3 or x = −½"],
};
const STATE = { 1: "done", 2: "done", 3: "current", 4: "flagged" }; // others = unanswered

export default async function PracticeSessionPage({ params }) {
  const { id } = await Promise.resolve(params);
  return (
    <AppShell>
      <PageHeader
        back={{ href: "/exam-centre", label: "Exam Centre" }}
        title={titleCase(id)}
        action={<span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"><Timer className="size-4 text-primary" /> {TIME_LEFT}</span>}
      />

      <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
        <span>Question {CURRENT} of {TOTAL}</span><span>{Math.round((CURRENT / TOTAL) * 100)}%</span>
      </div>
      <ProgressBar value={(CURRENT / TOTAL) * 100} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="!p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>[{QUESTION.marks} marks]</span>
              <button type="button" className="inline-flex items-center gap-1 font-medium hover:text-foreground"><Flag className="size-3.5" /> Flag</button>
            </div>
            <p className="mt-3 text-lg font-semibold leading-snug">{QUESTION.text}</p>
            <div className="mt-6 space-y-3">
              {QUESTION.options.map((o, i) => (
                <button key={o} type="button" className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${i === 0 ? "border-primary bg-brand-soft" : "border-border hover:bg-muted"}`}>
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{"ABCD"[i]}</span>
                  {o}
                </button>
              ))}
            </div>
          </Card>
          <div className="mt-4 flex items-center justify-between gap-3">
            <GhostButton icon={ChevronLeft}>Previous</GhostButton>
            <PrimaryButton>Next <ChevronRight className="size-4" /></PrimaryButton>
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <p className="text-sm font-semibold">Questions</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => {
                const s = STATE[n];
                const cls = s === "current" ? "border-primary bg-primary text-primary-foreground"
                  : s === "done" ? "border-success bg-success-soft text-success"
                  : s === "flagged" ? "border-gold bg-gold-soft"
                  : "border-border text-muted-foreground";
                return <button key={n} type="button" className={`grid h-10 place-items-center rounded-lg border text-sm font-semibold ${cls}`}>{n}</button>;
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>■ Answered</span><span>■ Flagged</span><span>■ Not answered</span>
            </div>
          </Card>
          <PrimaryButton className="w-full">Submit session</PrimaryButton>
        </aside>
      </div>
    </AppShell>
  );
}
