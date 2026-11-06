"use client";
// "Your sessions": the student's real planner rows. Tick one off to earn XP.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, PlayCircle, Trash2 } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { reportXp } from "@/lib/xpClient";

export function PlannerList({ plans, signedIn }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const pending = plans.filter((p) => !p.done);
  const done = plans.filter((p) => p.done).slice(0, 5);

  async function call(method, id, url = "/api/planner") {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(method === "DELETE" ? `${url}?id=${encodeURIComponent(id)}` : url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "PATCH" ? JSON.stringify({ id }) : undefined,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Something went wrong.");
      reportXp(json?.xp);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!signedIn) {
    return (
      <Card className="text-sm text-muted-foreground">
        <Link href="/login?next=/planner" className="font-medium text-primary hover:underline">Log in</Link> or{" "}
        <Link href="/signup?next=/planner" className="font-medium text-primary hover:underline">sign up free</Link> to save your sessions.
      </Card>
    );
  }

  if (!pending.length && !done.length) {
    return <Card className="text-sm text-muted-foreground">No sessions yet. Add one above and it will show up here and in the Exam Centre.</Card>;
  }

  return (
    <div className="space-y-3">
      {pending.map((p) => (
        <Card key={p.id} className="!p-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label={`Tick off ${p.title}`}
              disabled={busyId === p.id}
              onClick={() => call("PATCH", p.id)}
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-input hover:border-success disabled:opacity-60"
            >
              {busyId === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5 text-transparent hover:text-success" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.minutes} min · {p.level}</p>
              <div className="mt-2 flex items-center gap-3">
                <Link href={`/practice/${encodeURIComponent(p.id)}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <PlayCircle className="size-3.5" /> Start
                </Link>
                <button type="button" onClick={() => call("DELETE", p.id)} disabled={busyId === p.id} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {done.length > 0 && (
        <>
          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Done</p>
          {done.map((p) => (
            <Card key={p.id} className="flex items-start gap-3 !p-4 opacity-70">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-success bg-success text-white"><Check className="size-3.5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug text-muted-foreground line-through">{p.title}</p>
                <Badge tone="success">Completed</Badge>
              </div>
            </Card>
          ))}
        </>
      )}
      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
