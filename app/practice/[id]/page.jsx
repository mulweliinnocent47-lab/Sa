// app/practice/[id]/page.jsx   (server component: keeps metadata + the layout shell)
import { AppShell } from "@/components/AppShell";
import { PracticeSession } from "@/components/PracticeSession";

export const metadata = { title: "Practice — SA Student" };

export default async function PracticeSessionPage({ params }) {
  const { id } = await Promise.resolve(params);
  return (
    <AppShell>
      <PracticeSession id={id} />
    </AppShell>
  );
}
