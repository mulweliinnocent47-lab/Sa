import Link from "next/link";
import { Calculator, FlaskConical, Languages, Landmark, Leaf, Globe2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, Chip, ChipRow, IconBox, PageHeader, ProgressBar, SearchBar } from "@/components/ui";

export const metadata = { title: "Subjects — SA Student" };

// ── PLACEHOLDER DATA ── replace with your real subjects (slug is used in /subjects/[slug])
const GRADES = ["All", "Grade 10", "Grade 11", "Grade 12"];
const SUBJECTS = [
  { slug: "mathematics", name: "Mathematics", icon: Calculator, tone: "brand", papers: 24, notes: 18, progress: 62 },
  { slug: "physical-sciences", name: "Physical Sciences", icon: FlaskConical, tone: "success", papers: 20, notes: 14, progress: 45 },
  { slug: "life-sciences", name: "Life Sciences", icon: Leaf, tone: "success", papers: 18, notes: 22, progress: 71 },
  { slug: "english-home-language", name: "English Home Language", icon: Languages, tone: "gold", papers: 16, notes: 12, progress: 80 },
  { slug: "history", name: "History", icon: Landmark, tone: "gold", papers: 12, notes: 15, progress: 33 },
  { slug: "geography", name: "Geography", icon: Globe2, tone: "brand", papers: 14, notes: 10, progress: 54 },
];

export default function SubjectsPage() {
  return (
    <AppShell>
      <PageHeader title="Subjects" subtitle="Pick a subject to see its notes, past papers and practice." />
      <SearchBar placeholder="Search subjects" />
      <div className="mt-3"><ChipRow>{GRADES.map((g, i) => <Chip key={g} active={i === 0}>{g}</Chip>)}</ChipRow></div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((s) => (
          <Link key={s.slug} href={`/subjects/${s.slug}`} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <div className="flex items-center gap-3">
                <IconBox icon={s.icon} tone={s.tone} />
                <h3 className="font-semibold leading-tight">{s.name}</h3>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{s.papers} papers · {s.notes} notes</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1"><ProgressBar value={s.progress} /></div>
                <span className="text-xs font-semibold text-muted-foreground">{s.progress}%</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
