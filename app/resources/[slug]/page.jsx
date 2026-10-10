import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, Download, Bookmark } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, GhostButton, PageHeader, PrimaryButton, SectionTitle, titleCase } from "@/components/ui";

export const metadata = { title: "Resource — SA Student" };

// ── PLACEHOLDER DATA ── load by `slug`
const META = { subject: "Mathematics", grade: 10, type: "Notes", minutes: 8, updated: "2 Oct 2026" };
const OUTLINE = ["Introduction", "Key formulas", "Worked examples", "Common mistakes", "Practice questions"];
const RELATED = [
  { slug: "functions-summary", title: "Functions summary", meta: "Notes · 9 min" },
  { slug: "algebra-practice-set", title: "Algebra practice set", meta: "Practice · 20 questions" },
  { slug: "maths-p1-nov-2023", title: "Paper 1 · Nov 2023", meta: "Past paper" },
];

function SkeletonLines({ rows = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 rounded-full bg-muted" style={{ width: `${100 - (i % 3) * 12}%` }} />
      ))}
    </div>
  );
}

export default async function ResourcePage({ params }) {
  const { slug } = await Promise.resolve(params);
  return (
    <AppShell>
      <PageHeader
        back={{ href: "/resources", label: "All resources" }}
        title={titleCase(slug)}
        subtitle={`${META.subject} · Grade ${META.grade} · Updated ${META.updated}`}
        action={<GhostButton icon={Bookmark}>Save</GhostButton>}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone="brand"><BookOpen className="size-3" /> {META.type}</Badge>
        <Badge tone="muted"><Clock className="size-3" /> {META.minutes} min read</Badge>
        <Badge tone="success">Free</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reader — drop your TxtReader / PDF viewer here */}
        <Card className="lg:col-span-2 !p-6 md:!p-8">
          <div className="space-y-8">
            {OUTLINE.slice(0, 3).map((h) => (
              <section key={h}>
                <h2 className="mb-3 text-lg font-bold">{h}</h2>
                <SkeletonLines rows={4} />
              </section>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">↑ Replace this block with the real content</p>
        </Card>

        <aside className="space-y-4">
          <Card>
            <PrimaryButton icon={Download} className="w-full">Download</PrimaryButton>
            <GhostButton icon={CheckCircle2} className="mt-2 w-full">Mark as done</GhostButton>
          </Card>
          <Card>
            <p className="text-sm font-semibold">On this page</p>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              {OUTLINE.map((h, i) => <li key={h} className="flex gap-2"><span className="text-xs">{i + 1}.</span>{h}</li>)}
            </ol>
          </Card>
          <div>
            <SectionTitle title="Related" />
            <div className="space-y-2">
              {RELATED.map((r) => (
                <Link key={r.slug} href={`/resources/${r.slug}`} className="block rounded-xl border border-border bg-card p-3 hover:bg-muted">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.meta}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
