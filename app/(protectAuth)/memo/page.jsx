"use client";

// app/(protectAuth)/memos/page.jsx
import { useMemo, useState } from "react";
import { Search, StickyNote, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DownloadButton } from "@/components/DownloadButton";
import { Badge, Card, Chip, ChipRow, IconBox, PageHeader } from "@/components/ui";
import { useNotes } from "@/components/Noteprovider";

// ── PLACEHOLDER DATA ── swap for real memos (e.g. a GetMemos() like lib/paperServer.js).
// `path` = file path inside your Supabase bucket, used by /api/download.
/* const MEMOS = [
  { id: "m1", title: "Paper 1 memo", subject: "Mathematics", grade: 12, year: 2023, session: "Nov", pages: 14, pro: false, path: "grade-12-Mathematics/memos/p1-nov-2023-memo.pdf" },
  { id: "m2", title: "Paper 2 memo", subject: "Mathematics", grade: 12, year: 2023, session: "Nov", pages: 12, pro: false, path: "grade-12-Mathematics/memos/p2-nov-2023-memo.pdf" },
  { id: "m3", title: "Paper 1 memo", subject: "Physical Sciences", grade: 12, year: 2024, session: "June", pages: 10, pro: true, path: "" },
  { id: "m4", title: "Paper 2 memo", subject: "Life Sciences", grade: 11, year: 2024, session: "Nov", pages: 9, pro: true, path: "" },
]; */

export default function MemosPage() {
	const { MEMOS } = useNotes() ?? {};
	
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  const subjects = useMemo(() => ["All", ...new Set(MEMOS.map((m) => m.subject))], []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEMOS.filter((m) => {
      const text = `${m.title} ${m.subject} grade ${m.grade} ${m.year} ${m.session}`.toLowerCase();
      return (subject === "All" || m.subject === subject) && (!q || text.includes(q));
    });
  }, [query, subject]);

  return (
    <AppShell>
      <PageHeader
        back={{ href: "/resources", label: "All resources" }}
        title="Memos"
        subtitle="Marking guidelines for past papers. Mark yourself and see where you lost marks."
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subject, year or session"
          aria-label="Search memos"
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="mt-3">
        <ChipRow>
          {subjects.map((s) => (
            <Chip key={s} active={subject === s} onClick={() => setSubject(s)}>{s}</Chip>
          ))}
        </ChipRow>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((m) => (
          <Card key={m.id} className="flex h-full flex-col">
            <div className="flex items-start justify-between">
              <IconBox icon={StickyNote} tone="success" />
              {m.pro ? <Badge tone="gold"><Lock className="size-3" /> Pro</Badge> : <Badge tone="success">Free</Badge>}
            </div>

            <h3 className="mt-4 font-semibold leading-snug">{m.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {m.subject} · Grade {m.grade} · {m.year} · {m.session}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PDF · {m.pages} pages</p>

            {m.pro || !m.path ? (
              <button
                type="button"
                disabled
                className="mt-auto inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm font-medium text-muted-foreground"
              >
                <Lock className="size-4" /> {m.pro ? "Upgrade to unlock" : "Coming soon"}
              </button>
            ) : (
              <DownloadButton
                href={`/api/download?path=${encodeURIComponent(m.path)}&filename=${encodeURIComponent(`${m.subject} ${m.title} ${m.year}.pdf`)}`}
                className="mt-auto inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              />
            )}
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <div className="py-16 text-center">
          <StickyNote className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No memos match your search.</p>
        </div>
      )}
    </AppShell>
  );
}
