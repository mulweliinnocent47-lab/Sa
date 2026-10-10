import Link from "next/link";
import { BookOpen, FileText, Lock, PlayCircle, StickyNote } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, Chip, ChipRow, IconBox, PageHeader, SearchBar } from "@/components/ui";

export const metadata = { title: "Resources — SA Student" };

// ── PLACEHOLDER DATA ── replace with notes / papers / memos from your backend
const FILTERS = ["All", "Notes", "Past papers", "Memos", "Videos"];
const TYPE = {
  Notes: { icon: BookOpen, tone: "brand" },
  "Past paper": { icon: FileText, tone: "gold" },
  Memo: { icon: StickyNote, tone: "success" },
  Video: { icon: PlayCircle, tone: "danger" },
};
const RESOURCES = [
  { slug: "algebra-summary", title: "Algebra summary", type: "Notes", subject: "Mathematics", grade: 10, meta: "8 min read", pro: false },
  { slug: "maths-p1-nov-2023", title: "Paper 1 · November 2023", type: "Past paper", subject: "Mathematics", grade: 12, meta: "3 hrs · 150 marks", pro: false },
  { slug: "maths-p1-nov-2023-memo", title: "Paper 1 memo · November 2023", type: "Memo", subject: "Mathematics", grade: 12, meta: "PDF · 14 pages", pro: false },
  { slug: "photosynthesis-explained", title: "Photosynthesis explained", type: "Video", subject: "Life Sciences", grade: 10, meta: "11 min", pro: true },
  { slug: "essay-structure", title: "Essay structure cheat-sheet", type: "Notes", subject: "English HL", grade: 11, meta: "5 min read", pro: true },
  { slug: "history-cold-war", title: "The Cold War timeline", type: "Notes", subject: "History", grade: 12, meta: "10 min read", pro: false },
];

export default function ResourcesPage() {
  return (
    <AppShell>
      <PageHeader title="Resources" subtitle="Notes, past papers, memos and videos in one place." />
      <SearchBar placeholder="Search resources" />
      <div className="mt-3"><ChipRow>{FILTERS.map((f, i) => <Chip key={f} active={i === 0}>{f}</Chip>)}</ChipRow></div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((r) => {
          const t = TYPE[r.type];
          return (
            <Link key={r.slug} href={`/resources/${r.slug}`} className="group">
              <Card className="flex h-full flex-col transition-shadow group-hover:shadow-md">
                <div className="flex items-start justify-between">
                  <IconBox icon={t.icon} tone={t.tone} />
                  {r.pro ? <Badge tone="gold"><Lock className="size-3" /> Pro</Badge> : <Badge tone="success">Free</Badge>}
                </div>
                <h3 className="mt-4 font-semibold leading-snug">{r.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{r.subject} · Grade {r.grade}</p>
                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                  <span>{r.type}</span><span>{r.meta}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Looking for the originals? <Link href="/notes" className="font-medium text-primary">Notes</Link> · <Link href="/papers" className="font-medium text-primary">Papers</Link>
      </p>
    </AppShell>
  );
}
