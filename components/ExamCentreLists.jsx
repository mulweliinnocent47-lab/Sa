"use client";

// components/ExamCentreLists.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, PlayCircle } from "lucide-react";
import { Badge, Card, PrimaryButton, SectionTitle } from "@/components/ui";

const FIRST = 3; // how many show at first
const STEP = 10; // how many each "Show more" adds
const LEVEL_TONE = { Mixed: "brand", Easy: "success", Medium: "gold", Hard: "danger", Extreme: "danger" };

function MoreControls({ shown, total, onMore, onLess }) {
  if (total <= FIRST) return null;
  const remaining = total - shown;
  const btn =
    "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted";
  return (
    <div className="mt-3 flex gap-2">
      {remaining > 0 && (
        <button type="button" onClick={onMore} className={btn}>
          <ChevronDown className="size-4" /> Show {Math.min(STEP, remaining)} more
          <span className="text-xs text-muted-foreground">({remaining} left)</span>
        </button>
      )}
      {shown > FIRST && (
        <button type="button" onClick={onLess} className={btn}>
          <ChevronUp className="size-4" /> Show less
        </button>
      )}
    </div>
  );
}

export function ExamCentreLists({ timetable = [], sessions = [] }) {
  const [tCount, setTCount] = useState(FIRST);
  const [sCount, setSCount] = useState(FIRST);

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
      {/* TIMETABLE */}
      <section className="min-w-0">
        <SectionTitle title="Exam timetable" />
        {timetable.length === 0 && (
          <Card className="text-sm text-muted-foreground">No more exams on the timetable. Well done!</Card>
        )}
        <div className="space-y-3">
          {timetable.slice(0, tCount).map((e, i) => (
            // key must be unique: many exams share the same date
            <Card key={`${e.date}-${e.subject}-${i}`} className="flex items-start gap-4 !p-4">
              <div className="w-14 shrink-0 rounded-xl bg-brand-soft py-2 text-center text-primary">
                <p className="text-[11px] font-semibold uppercase">{e.day}</p>
                <p className="text-sm font-bold">{e.date}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold leading-snug">{e.subject}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {e.time} · {e.length}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <MoreControls
          shown={Math.min(tCount, timetable.length)}
          total={timetable.length}
          onMore={() => setTCount((c) => c + STEP)}
          onLess={() => setTCount(FIRST)}
        />
      </section>

      {/* PRACTICE SESSIONS */}
      <section className="min-w-0">
        <SectionTitle title="Practice sessions" />
        <div className="space-y-3">
          {sessions.slice(0, sCount).map((s) => (
            <Card key={s.id} className="!p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-semibold leading-snug">{s.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.kind} · {s.minutes} min
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {s.planned && <Badge tone="success">My plan</Badge>}
                  <Badge tone={LEVEL_TONE[s.level] ?? "muted"}>{s.level}</Badge>
                </div>
              </div>
              <PrimaryButton href={`/practice/${s.id}`} icon={PlayCircle} className="mt-4 w-full">
                Start session
              </PrimaryButton>
            </Card>
          ))}
        </div>
        <MoreControls
          shown={Math.min(sCount, sessions.length)}
          total={sessions.length}
          onMore={() => setSCount((c) => c + STEP)}
          onLess={() => setSCount(FIRST)}
        />
      </section>
    </div>
  );
}
