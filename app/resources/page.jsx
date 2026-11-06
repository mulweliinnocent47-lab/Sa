import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/ui";
import { ResourcesBrowser } from "@/components/ResourcesBrowser";
import { getNotes } from "@/lib/notesHelper.js";
import { GetPapers } from "@/lib/paperServer.js";
import { GetMemos } from "@/lib/memoServer.js";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resources — SA Student" };

// Real notes, past papers and memos in one searchable list.
export default async function ResourcesPage() {
  const [notes, papers, memos] = await Promise.all([getNotes(), GetPapers(), GetMemos()]);

  const items = [
    ...(notes ?? []).map((n) => ({
      id: `note-${n.slug}`, type: "Notes", title: n.title, subject: n.subject, grade: n.grade,
      meta: `${n.minutes} min read`, href: `/notes/${encodeURIComponent(n.slug)}`,
    })),
    ...(papers ?? []).map((p) => ({
      id: `paper-${p.id}`, type: "Past paper", title: p.title, subject: p.subject, grade: p.grade,
      meta: `PDF · ${p.year}`, href: "/papers",
    })),
    ...(memos ?? []).map((m) => ({
      id: `memo-${m.id}`, type: "Memo", title: m.title, subject: m.subject, grade: m.grade,
      meta: `PDF · ${m.year}`, href: "/memo",
    })),
  ];

  return (
    <AppShell>
      <PageHeader title="Resources" subtitle="Notes, past papers and memos in one place. All free." />
      <ResourcesBrowser items={items} />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Browse by type: <Link href="/notes" className="font-medium text-primary">Notes</Link> ·{" "}
        <Link href="/papers" className="font-medium text-primary">Papers</Link> ·{" "}
        <Link href="/memo" className="font-medium text-primary">Memos</Link> ·{" "}
        <Link href="/video" className="font-medium text-primary">Videos (soon)</Link>
      </p>
    </AppShell>
  );
}
