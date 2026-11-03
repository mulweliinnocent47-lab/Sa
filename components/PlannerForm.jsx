"use client";

// components/PlannerForm.jsx
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus, Shuffle } from "lucide-react";
import { Badge, Card, SectionTitle } from "@/components/ui";

// ── PLACEHOLDER BODY ── this is the shape sent to your API.
// Replace userId with the real user.id (or read it on the server and drop it from here).
const PLACEHOLDER_BODY = {
  userId: "USER_ID_HERE",
  subject: "Mathematics",
  topic: "Quadratic equations",
  level: "Medium",
  time: "16:00",
};

const API_URL = "/api/planner"; // ← your endpoint (it also verifies the topic is school related)

const SUBJECTS = [
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
  "Life Sciences",
  "Accounting",
  "Business Studies",
  "Economics",
  "Geography",
  "History",
  "English Home Language",
  "Afrikaans",
  "isiZulu",
  "Tourism",
  "Agricultural Sciences",
  "Computer Applications Technology",
  "Information Technology",
  "Life Orientation",
];

const LEVELS = ["Easy", "Medium", "Hard", "Extreme"];

// ── SUGGESTIONS ── three random ones are shown each time
const SUGGESTIONS = [
  { subject: "Mathematics", topic: "Quadratic equations" },
  { subject: "Mathematics", topic: "Differential calculus" },
  { subject: "Mathematics", topic: "Sequences and series" },
  { subject: "Mathematical Literacy", topic: "Finance: interest and loans" },
  { subject: "Physical Sciences", topic: "Newton's laws of motion" },
  { subject: "Physical Sciences", topic: "Acids and bases" },
  { subject: "Life Sciences", topic: "DNA and protein synthesis" },
  { subject: "Life Sciences", topic: "Human reproduction" },
  { subject: "Accounting", topic: "Cash flow statements" },
  { subject: "Business Studies", topic: "Business environments" },
  { subject: "Economics", topic: "Inflation and the CPI" },
  { subject: "Geography", topic: "Mapwork and orientation" },
  { subject: "History", topic: "The Cold War" },
  { subject: "English Home Language", topic: "Poetry analysis" },
  { subject: "Tourism", topic: "Sustainable tourism" },
  { subject: "Agricultural Sciences", topic: "Soil fertility" },
  { subject: "Information Technology", topic: "Object-oriented programming" },
];

function pickThree() {
  const a = [...SUGGESTIONS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, 3);
}

const field =
  "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25";

export function PlannerForm() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Medium");
  const [time, setTime] = useState("16:00");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  // Random picks happen after mount so server and client HTML match.
  const [picks, setPicks] = useState([]);
  useEffect(() => setPicks(pickThree()), []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setDone("");

    const cleanTopic = topic.trim();
    if (!subject) return setError("Choose a subject.");
    if (cleanTopic.length < 3) return setError("Enter a topic (at least 3 characters).");
    if (!time) return setError("Choose a time.");

    const body = { ...PLACEHOLDER_BODY, subject, topic: cleanTopic, level, time };

    setBusy(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);

      // Your API can reject non-school topics with { ok:false, error:"..." }
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || "Could not add the session. Please try again.");
      }
      setDone(`Added: ${subject} · ${cleanTopic} at ${time}`);
      setTopic("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function useSuggestion(s) {
    setSubject(s.subject);
    setTopic(s.topic);
    setError("");
    setDone("");
  }

  return (
    <div className="mb-8 space-y-6">
      {/* ADD A SESSION */}
      <Card className="!p-5">
        <h2 className="text-lg font-bold tracking-tight">Add a study session</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a subject, tell us the topic and when you'll study.</p>

        <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-xs font-medium text-muted-foreground">Subject</label>
            <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={field}>
              <option value="">Select a subject</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="level" className="mb-1.5 block text-xs font-medium text-muted-foreground">Level</label>
            <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className={field}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="topic" className="mb-1.5 block text-xs font-medium text-muted-foreground">Topic</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={100}
              autoComplete="off"
              placeholder="e.g. Quadratic equations"
              className={field}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Must be about school work. We check this before adding it.</p>
          </div>

          <div>
            <label htmlFor="time" className="mb-1.5 block text-xs font-medium text-muted-foreground">Time in Minutes</label>
            <input id="time" type="number" value={time} onChange={(e) => setTime(e.target.value)} className={field} />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {busy ? "Checking…" : "Add session"}
            </button>
          </div>
        </form>

        {error && <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {done && (
          <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-success-soft p-3 text-sm text-success">
            <CheckCircle2 className="size-4 shrink-0" /> {done}
          </p>
        )}
      </Card>

      {/* SUGGESTIONS */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-bold tracking-tight">Suggestions</h2>
          <button
            type="button"
            onClick={() => setPicks(pickThree())}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Shuffle className="size-4" /> Shuffle
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {picks.length === 0
            ? [0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)
            : picks.map((s) => (
                <button
                  key={`${s.subject}-${s.topic}`}
                  type="button"
                  onClick={() => useSuggestion(s)}
                  className="text-left"
                >
                  <Card className="h-full !p-4 transition-colors hover:border-primary">
                    <Badge tone="brand">{s.subject}</Badge>
                    <p className="mt-2 text-sm font-semibold leading-snug">{s.topic}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Tap to fill the form</p>
                  </Card>
                </button>
              ))}
        </div>
      </section>
    </div>
  );
}
