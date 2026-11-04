import { AppShell } from "@/components/AppShell";
import { PracticeSession } from "@/components/PracticeSession";
import { getSession } from "@/lib/practice-sessions";
import { getPlannedSessions } from "@/lib/plannerAPIFetch";

export const metadata = { title: "Practice — SA Student" };

export default async function PracticeSessionPage({ params }) {
  const { id } = await Promise.resolve(params);
  const session =
    getSession(id) ?? (await getPlannedSessions()).find((s) => s.id === id) ?? null;

  return (
    <AppShell>
      <PracticeSession id={id} session={session} />
    </AppShell>
  );
}
