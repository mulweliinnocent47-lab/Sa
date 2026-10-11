import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Target,
  Check,
  Circle,
} from "lucide-react";
import { cache } from "react";

import { AppShell } from "@/components/AppShell";
import {
  Badge,
  Card,
  PageHeader,
  PrimaryButton,
  GhostButton,
  ProgressBar,
  SectionTitle,
  Stat,
  titleCase,
} from "@/components/ui";

import { GetSubject } from "@/lib/subjectServer";
import {GetPapers} from "@/lib/paperServer";
import { Button2 } from "@/Client actions/buttonConfigSubject";

export const metadata = { title: "Subject — SA Student" };

const STATS = {
  papers: "24+",
  notes: "18+",
  average: "2%",
};

// Keep your existing topic progress until you connect real topic data.
const TOPICS2 = [
  { name: "Algebra and equations", lessons: 8, done: 8 },
  { name: "Functions and graphs", lessons: 10, done: 6 },
  { name: "Trigonometry", lessons: 9, done: 3 },
  { name: "Finance and growth", lessons: 6, done: 0 },
  { name: "Probability", lessons: 7, done: 0 },
];

export default async function SubjectPage({ params, searchParams }) {
  const { subject } = await params;
  const { grade, tab } = await searchParams;

  const name = titleCase(subject);
  const prop = String(grade ?? "");

  // Get every note matching this subject and grade.
  const notes = await getServerSubject(subject, grade);

  // Only the Overview uses the first three notes.
  const previewNotes = notes.slice(0, 3);

  // Only fetch and filter papers when the Papers tab is selected.
  const requestedTab = String(tab ?? "Overview").toLowerCase();

  const activeTab = ["overview", "notes", "papers"].includes(requestedTab)
    ? requestedTab
    : "overview";

  const papers =
    activeTab === "papers"
      ? await getServerPapers(subject, grade)
      : [];

  // Keep the selected subject and grade when opening /papers.
  const papersHref =
    `/papers?subject=${encodeURIComponent(subject)}` +
    `&grade=${encodeURIComponent(prop)}`;

  const resourcesHref =
    `/resources?subject=${encodeURIComponent(subject)}` +
    `&grade=${encodeURIComponent(prop)}`;

  return (
    <AppShell>
      <PageHeader
        back={{ href: "/subjects", label: "All subjects" }}
        title={name}
        subtitle="Overview of topics, resources and your progress in this subject."
        action={
          <PrimaryButton
            href="/exam-centre"
            icon={ClipboardCheck}
          >
            Start practice
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={FileText}
          label="Past papers"
          value={STATS.papers}
        />
        <Stat
          icon={BookOpen}
          label="Notes"
          value={STATS.notes}
          tone="success"
        />
        <Stat
          icon={Target}
          label="Your average"
          value={STATS.average}
          tone="gold"
        />
      </div>

      <div className="mt-6">
        <Button2 prop={prop} value={subject} />
      </div>

      {/* NOTES TAB */}
      {activeTab === "notes" && (
        <section className="mt-6">
          <SectionTitle title={`All notes (${notes.length})`} />

          {notes.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground">
                No notes found for {name}, Grade {prop}.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {notes.map((note, index) => (
                <Card
                  key={`${note.folder}-${note.name}-${index}`}
                  className="flex items-center gap-3 !p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
                    <BookOpen className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {note.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Grade {note.grade}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PAPERS TAB */}
      {activeTab === "papers" && (
        <section className="mt-6">
          <SectionTitle title={`Past papers (${papers.length})`} />

          {papers.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground">
                No papers found for {name}, Grade {prop}.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {papers.map((paper) => (
                <Link
                  key={paper.id}
                  href={papersHref}
                  className="block"
                >
                  <Card className="flex h-full items-start gap-3 !p-4 transition hover:border-primary">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
                      <FileText className="size-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {paper.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {paper.year} · {paper.session} ·{" "}
                        {paper.province}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {paper.pages} pages
                      </p>

                      <p className="mt-3 text-sm font-medium text-primary">
                        Open papers →
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* OVERVIEW TAB — shown by default */}
      {activeTab === "overview" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <SectionTitle title="Topics" />

            <div className="space-y-3">
              {TOPICS2.map((topic) => {
                const pct = Math.round(
                  (topic.done / topic.lessons) * 100
                );

                return (
                  <Card
                    key={topic.name}
                    className="flex items-center gap-4 !p-4"
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full ${
                        pct === 100
                          ? "bg-success-soft text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {pct === 100 ? (
                        <Check className="size-4" />
                      ) : (
                        <Circle className="size-3" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {topic.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {topic.done}/{topic.lessons} lessons
                      </p>

                      <div className="mt-2">
                        <ProgressBar
                          value={pct}
                          tone={pct === 100 ? "success" : "primary"}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* First three notes appear on Overview only. */}
            <div className="mt-6">
              <SectionTitle title="Recent notes" />

              <div className="space-y-3">
                {previewNotes.length === 0 ? (
                  <Card>
                    <p className="text-sm text-muted-foreground">
                      No notes available yet.
                    </p>
                  </Card>
                ) : (
                  previewNotes.map((note, index) => (
                    <Card
                      key={`${note.folder}-${note.name}-${index}`}
                      className="flex items-center gap-3 !p-4"
                    >
                      <BookOpen className="size-5 shrink-0" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {note.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Grade {note.grade}
                        </p>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {notes.length > 3 && (
                <Link
                  href={`/subjects/${encodeURIComponent(subject)}?grade=${encodeURIComponent(prop)}&tab=Notes`}
                  className="mt-3 inline-block text-sm font-medium text-primary"
                >
                  View all {notes.length} notes →
                </Link>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <Card>
              <Badge tone="gold">Up next</Badge>

              <p className="mt-3 font-semibold">
                Trigonometry — identities
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                12 min read · 5 practice questions
              </p>

              <PrimaryButton
                href={resourcesHref}
                className="mt-4 w-full"
              >
                Continue
              </PrimaryButton>
            </Card>

            <Card>
              <p className="text-sm font-semibold">Quick links</p>

              <div className="mt-3 flex flex-col gap-2">
                <GhostButton
                  href={resourcesHref}
                  icon={BookOpen}
                >
                  Notes & papers
                </GhostButton>

                <GhostButton href="/ai-tutor">
                  Ask the AI Tutor
                </GhostButton>

                <GhostButton href={papersHref}>
                  View past papers
                </GhostButton>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

// Return all notes matching the subject slug and grade.
const getServerSubject = cache(async (slug, grade) => {
  if (!slug || grade == null) return [];

  const allFiles = await GetSubject();

  if (!Array.isArray(allFiles)) return [];

  return allFiles
    .filter((file) => {
      const folder = String(file.folder ?? "");

      const fileSlug = folder
        .replace(/^grade-\d+-/i, "")
        .toLowerCase()
        .replace(/\s+/g, "-");

      const fileGrade = folder.match(/^grade-(\d+)-/i)?.[1];

      return (
        fileSlug === String(slug).toLowerCase() &&
        fileGrade === String(grade)
      );
    })
    .map((file) => ({
      ...file,
      slug: String(file.folder ?? "")
        .replace(/^grade-\d+-/i, "")
        .toLowerCase()
        .replace(/\s+/g, "-"),
      name: String(file.name ?? "Untitled").replace(/\.txt$/i, ""),
      grade: String(file.folder ?? "").match(/^grade-(\d+)-/i)?.[1],
    }));
});

// Get papers only for the requested subject and grade.
const getServerPapers = cache(async (slug, grade) => {
  if (!slug || grade == null) return [];

  const allPapers = await GetPapers();

  if (!Array.isArray(allPapers)) return [];

  const normalize = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

  return allPapers.filter(
    (paper) =>
      normalize(paper.subject) === normalize(slug) &&
      String(paper.grade) === String(grade)
  );
});