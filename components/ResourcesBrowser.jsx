"use client";
// Search + filter for the Resources hub. The items come from the real notes, papers and memos.
import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, Search, StickyNote } from "lucide-react";
import { Badge, Card, Chip, ChipRow, IconBox } from "@/components/ui";

const FILTERS = ["All", "Notes", "Past paper", "Memo"];
const TYPE = {
  Notes: { icon: BookOpen, tone: "brand" },
  "Past paper": { icon: FileText, tone: "gold" },
  Memo: { icon: StickyNote, tone: "success" },
};

export function ResourcesBrowser({ items }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (r) => (filter === "All" || r.type === filter) && (!q || `${r.title} ${r.subject} grade ${r.grade}`.toLowerCase().includes(q))
    );
  }, [items, query, filter]);

  return (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources"
          aria-label="Search resources"
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="mt-3">
        <ChipRow>
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f === "Past paper" ? "Papers" : f}</Chip>
          ))}
        </ChipRow>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => {
          const t = TYPE[r.type];
          return (
            <Link key={r.id} href={r.href} className="group">
              <Card className="flex h-full flex-col transition-shadow group-hover:shadow-md">
                <div className="flex items-start justify-between">
                  <IconBox icon={t.icon} tone={t.tone} />
                  <Badge tone="success">Free</Badge>
                </div>
                <h3 className="mt-4 font-semibold leading-snug">{r.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{[r.subject, r.grade && `Grade ${r.grade}`].filter(Boolean).join(" · ")}</p>
                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                  <span>{r.type}</span><span>{r.meta}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {results.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">Nothing matches your search.</p>}
    </>
  );
}
