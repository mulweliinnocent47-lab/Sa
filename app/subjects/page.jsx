
import Link from "next/link";
import {
  Calculator,
  FlaskConical,
  Languages,
  Landmark,
  Leaf,
  Globe2,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import {
  Card,
  IconBox,
  PageHeader,
  ProgressBar,
  SearchBar,
} from "@/components/ui";

import { GetSubject } from "@/lib/subjectServer";
import { cache } from "react";
import {Button} from "@/Client actions/buttonConfigSubject";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Subjects — SA Student",
};
const GRADES = ["7", "8", "9", "10", "11", "12"];

const getServerSubject = cache(async () => {
  const allFiles = await GetSubject();

  return allFiles.map((file) => {
    const match = file.folder.match(/^grade-(\d+)-/);

    const grade = match?.[1];

    const slug = file.folder
      .replace(/^grade-\d+-/, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    return {
      slug,
      name: slug
        .replace(/-/g, " ")
        .toUpperCase(),
      tone: "brand",
      papers: 24,
      notes: 18,
      grade,
      progress: 62,
    };
  });
});

export default async function SubjectsPage({ searchParams }) {
  const { grade } = await searchParams;

  // Default to Grade 10 when no grade is selected.
  if (!grade) {
    redirect("/subjects?grade=10");
  }

  const data = await getServerSubject();

  // Only show subjects for the selected grade.
  const gradeSubjects = data.filter(
    (subject) => subject.grade === String(grade)
  );

  // Remove duplicate subjects within that grade.
  const uniqueSubjects = gradeSubjects.filter(
    (subject, index, array) =>
      index ===
      array.findIndex(
        (item) => item.slug === subject.slug
      )
  );

  const icons = [
    Calculator,
    FlaskConical,
    Languages,
    Landmark,
    Leaf,
    Globe2,
  ];

  const SUBJECTS = uniqueSubjects.map((subject, index) => ({
    ...subject,
    icon: icons[index % icons.length],
  }));

  return (
    <AppShell>
      <PageHeader
        title={`Grade ${grade} Subjects`}
        subtitle="Pick a subject to see its notes, past papers and practice."
      />

      <SearchBar placeholder="Search subjects" />

      <div className="mt-3">
        <Button />
      </div>

      {SUBJECTS.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No subjects found for Grade {grade}.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject) => (
            <Link
              key={`${subject.grade}-${subject.slug}`}
              href={`/subjects/${subject.slug}?grade=${subject.grade}`}
              className="group"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <div className="flex items-center gap-3">
                  <IconBox
                    icon={subject.icon}
                    tone={subject.tone}
                  />

                  <h3 className="font-semibold leading-tight">
                    {subject.name}
                  </h3>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  {subject.papers} papers · {subject.notes} notes
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar value={subject.progress} />
                  </div>

                  <span className="text-xs font-semibold text-muted-foreground">
                    {subject.progress}%
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
