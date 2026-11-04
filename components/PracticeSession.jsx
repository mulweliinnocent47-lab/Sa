"use client";

// components/PracticeSession.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Flag, Loader2, RotateCcw, Timer, XCircle } from "lucide-react";
import { Badge, Card, PageHeader, ProgressBar } from "@/components/ui";
import { getSession } from "@/lib/practice-sessions";

const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted disabled:opacity-50";

const TYPE_LABEL = { multiple_choice: "Multiple choice", short_answer: "Short answer", calculation: "Calculation" };

/* ---------- marking ---------- */
const norm = (s) =>
  String(s ?? "").toLowerCase().replace(/\s+/g, "").replace(/,/g, ".").replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/\.$/, "");

function isCorrect(q, answer) {
  if (!answer || !answer.trim()) return false;
  if (q.type === "multiple_choice") return answer === q.correctAnswer;
  const a = norm(answer);
  const c = norm(q.correctAnswer);
  if (a === c) return true;
  const isNum = (v) => /^-?\d*\.?\d+$/.test(v);
  return isNum(a) && isNum(c) && Math.abs(parseFloat(a) - parseFloat(c)) < 1e-9;
}

function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function PracticeSession({ id, session })  {
  
  const storageKey = `practice:${id}`;

  const [phase, setPhase] = useState("loading"); // loading | error | quiz | result
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [overrides, setOverrides] = useState({}); // student self-marked "I was right"
  const [current, setCurrent] = useState(0);
  const [endAt, setEndAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const started = useRef(false);

  /* ---------- load questions (or restore an unfinished attempt) ---------- */
  const load = useCallback(
    async (fresh = false) => {
      if (!session) return;
      setPhase("loading");
      setError("");

      if (!fresh) {
        try {
          const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
          if (saved?.data?.questions?.length && saved.endAt > Date.now()) {
            setData(saved.data);
            setAnswers(saved.answers || {});
            setFlagged(saved.flagged || {});
            setCurrent(saved.current || 0);
            setEndAt(saved.endAt);
            setNow(Date.now());
            setPhase("quiz");
            return;
          }
        } catch {}
      }

      try {
        const res = await fetch("/api/practice/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: session.id,
            title: session.title,
            subject: session.subject,
            minutes: session.minutes,
            level: session.level,
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.questions?.length) {
          throw new Error(json?.error || "Could not generate the session. Please try again.");
        }
        setData(json);
        setAnswers({});
        setFlagged({});
        setOverrides({});
        setCurrent(0);
        setNow(Date.now());
        setEndAt(Date.now() + session.minutes * 60_000);
        setPhase("quiz");
      } catch (e) {
        setError(e.message || "Something went wrong.");
        setPhase("error");
      }
    },
    [session, storageKey]
  );

  useEffect(() => {
    if (started.current) return; // stops a double AI call in React dev strict mode
    started.current = true;
    load(false);
  }, [load]);

  /* ---------- save progress so a refresh does not lose it ---------- */
  useEffect(() => {
    if (phase !== "quiz" || !data) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ data, answers, flagged, current, endAt }));
    } catch {}
  }, [phase, data, answers, flagged, current, endAt, storageKey]);

  /* ---------- countdown ---------- */
  useEffect(() => {
    if (phase !== "quiz") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const remaining = Math.max(0, endAt - now);

  const submit = useCallback(() => {
    try { sessionStorage.removeItem(storageKey); } catch {}
    setPhase("result");
    window.scrollTo?.({ top: 0 });
  }, [storageKey]);

  useEffect(() => {
    if (phase === "quiz" && endAt && remaining === 0) submit(); // time is up
  }, [phase, endAt, remaining, submit]);

  /* ---------- not found ---------- */
  if (!session) {
    return (
      <>
        <PageHeader back={{ href: "/exam-centre", label: "Exam Centre" }} title="Session not found" />
        <Card className="text-sm text-muted-foreground">
          We could not find a practice session called “{id}”. Go back to the Exam Centre and pick one from the list.
        </Card>
      </>
    );
  }

  const header = (action) => (
    <PageHeader back={{ href: "/exam-centre", label: "Exam Centre" }} title={session.title} action={action} />
  );

  /* ---------- loading ---------- */
  if (phase === "loading") {
    return (
      <>
        {header()}
        <Card className="flex flex-col items-center gap-3 !py-14 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-semibold">Writing your questions…</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The AI is building a fresh {session.subject} session for you. This can take up to a minute.
          </p>
        </Card>
      </>
    );
  }

  /* ---------- error ---------- */
  if (phase === "error") {
    return (
      <>
        {header()}
        <Card className="flex flex-col items-center gap-3 !py-12 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="font-semibold">Could not start the session</p>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          <button type="button" onClick={() => load(true)} className={btnPrimary}>
            <RotateCcw className="size-4" /> Try again
          </button>
        </Card>
      </>
    );
  }

  const questions = data.questions;
  const total = questions.length;

  /* ---------- results ---------- */
  if (phase === "result") {
    const rows = questions.map((q) => {
      const auto = isCorrect(q, answers[q.id]);
      const right = auto || !!overrides[q.id];
      return { q, auto, right, earned: right ? q.marks : 0 };
    });
    const score = rows.reduce((s, r) => s + r.earned, 0);
    const totalMarks = data.totalMarks ?? questions.reduce((s, q) => s + q.marks, 0);
    const pct = totalMarks ? Math.round((score / totalMarks) * 100) : 0;

    return (
      <>
        {header()}

        <section className="overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-float md:p-8">
          <p className="text-sm font-semibold text-primary-foreground/85">Your score</p>
          <p className="mt-2 text-5xl font-bold tracking-tight md:text-6xl">{pct}%</p>
          <p className="mt-1 text-sm text-primary-foreground/85">
            {score} / {totalMarks} marks · {rows.filter((r) => r.right).length} of {total} correct
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => load(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-foreground px-4 text-sm font-medium text-primary hover:opacity-90">
              <RotateCcw className="size-4" /> New questions
            </button>
            <Link href="/exam-centre" className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-foreground/40 px-4 text-sm font-medium hover:bg-primary-foreground/10">
              Back to Exam Centre
            </Link>
          </div>
        </section>

        <h2 className="mb-3 mt-8 text-lg font-bold tracking-tight">Review your answers</h2>
        <div className="space-y-4">
          {rows.map(({ q, auto, right, earned }, i) => {
            const given = answers[q.id]?.trim();
            const correctOption = q.type === "multiple_choice" ? q.options.find((o) => o.startsWith(q.correctAnswer)) : null;
            const givenOption = q.type === "multiple_choice" && given ? q.options.find((o) => o.startsWith(given)) : null;
            return (
              <Card key={q.id} className="!p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Q{i + 1}</span>
                    <span>{TYPE_LABEL[q.type]}</span>
                    <span>· {q.topic}</span>
                  </div>
                  <Badge tone={right ? "success" : "danger"}>
                    {right ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />} {earned}/{q.marks}
                  </Badge>
                </div>

                <p className="mt-3 font-semibold leading-snug">{q.question}</p>

                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Your answer: </span>
                    {given ? (givenOption || given) : <em className="text-muted-foreground">No answer</em>}
                  </p>
                  {!right && (
                    <p>
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="font-semibold">{correctOption || q.correctAnswer}</span>
                    </p>
                  )}
                </div>

                <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{q.explanation}</p>

                {/* typed answers can be right but worded differently: let the student self-mark */}
                {q.type !== "multiple_choice" && given && !auto && (
                  <button
                    type="button"
                    onClick={() => setOverrides((o) => ({ ...o, [q.id]: !o[q.id] }))}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    {overrides[q.id] ? "Undo: mark as wrong" : "My answer is the same — mark as correct"}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  /* ---------- quiz ---------- */
  const q = questions[current];
  const answeredCount = questions.filter((x) => answers[x.id]?.trim()).length;
  const lowTime = remaining < 60_000;

  const setAnswer = (value) => setAnswers((a) => ({ ...a, [q.id]: value }));

  const onSubmit = () => {
    const left = total - answeredCount;
    if (left > 0 && !window.confirm(`You have ${left} unanswered question${left === 1 ? "" : "s"}. Submit anyway?`)) return;
    submit();
  };

  return (
    <>
      {header(
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${lowTime ? "border-destructive text-destructive" : "border-border bg-card"}`}>
          <Timer className={`size-4 ${lowTime ? "" : "text-primary"}`} /> {formatTime(remaining)}
        </span>
      )}

      <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
        <span>Question {current + 1} of {total}</span>
        <span>{answeredCount} answered</span>
      </div>
      <ProgressBar value={(answeredCount / total) * 100} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Card className="!p-6">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>[{q.marks} {q.marks === 1 ? "mark" : "marks"}] · {TYPE_LABEL[q.type]} · {q.difficulty}</span>
              <button
                type="button"
                onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
                className={`inline-flex items-center gap-1 font-medium hover:text-foreground ${flagged[q.id] ? "text-gold" : ""}`}
              >
                <Flag className="size-3.5" /> {flagged[q.id] ? "Flagged" : "Flag"}
              </button>
            </div>

            <p className="mt-3 whitespace-pre-line break-words text-lg font-semibold leading-snug">{q.question}</p>

            {q.type === "multiple_choice" ? (
              <div className="mt-6 space-y-3">
                {q.options.map((o) => {
                  const letter = o[0];
                  const selected = answers[q.id] === letter;
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setAnswer(letter)}
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${selected ? "border-primary bg-brand-soft" : "border-border hover:bg-muted"}`}
                    >
                      <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{letter}</span>
                      <span className="min-w-0 break-words">{o.replace(/^[A-D]\.\s*/, "")}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6">
                <label htmlFor="answer" className="mb-2 block text-xs font-medium text-muted-foreground">
                  {q.type === "calculation" ? "Type your final answer" : "Type your answer"}
                </label>
                {q.type === "calculation" ? (
                  <textarea
                    id="answer"
                    rows={3}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                ) : (
                  <input
                    id="answer"
                    type="text"
                    autoComplete="off"
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
                  />
                )}
              </div>
            )}
          </Card>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" className={btnGhost} disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              <ChevronLeft className="size-4" /> Previous
            </button>
            {current < total - 1 ? (
              <button type="button" className={btnPrimary} onClick={() => setCurrent((c) => c + 1)}>
                Next <ChevronRight className="size-4" />
              </button>
            ) : (
              <button type="button" className={btnPrimary} onClick={onSubmit}>Finish</button>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <p className="text-sm font-semibold">Questions</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {questions.map((x, i) => {
                const done = !!answers[x.id]?.trim();
                const cls =
                  i === current ? "border-primary bg-primary text-primary-foreground"
                  : flagged[x.id] ? "border-gold bg-gold-soft"
                  : done ? "border-success bg-success-soft text-success"
                  : "border-border text-muted-foreground";
                return (
                  <button key={x.id} type="button" onClick={() => setCurrent(i)} aria-label={`Go to question ${i + 1}`} className={`grid h-10 place-items-center rounded-lg border text-sm font-semibold ${cls}`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>■ Answered</span><span>■ Flagged</span><span>■ Not answered</span>
            </div>
          </Card>
          <button type="button" onClick={onSubmit} className={`${btnPrimary} w-full`}>Submit session</button>
        </aside>
      </div>
    </>
  );
}
