import { AppShell } from "@/components/AppShell";
import { PlannerForm } from "@/components/PlannerForm";
import { PlannerList } from "@/components/PlannerList";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui";
import Calendar from "@/components/calendar";
import { getCurrentUser } from "@/lib/authServer";
import { getPlannedSessions } from "@/lib/plannerAPIFetch";

export const metadata = { title: "Planner — SA Student" };
export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const { user } = await getCurrentUser();
  const plans = await getPlannedSessions();

  return (
    <AppShell>
      <PageHeader title="Planner" subtitle="Plan your sessions and tick them off to earn XP. Every session also shows up in the Exam Centre." />

      {/* add-session form + 3 random suggestions */}
      <PlannerForm />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Calendar />
        </div>

        <aside>
          <SectionTitle title="Your sessions" />
          <PlannerList plans={plans} signedIn={!!user} />
          <Card className="mt-4">
            <Badge tone="gold">Tip</Badge>
            <p className="mt-2 text-sm text-muted-foreground">Short, daily sessions beat one long cram. Aim for 3 per day.</p>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
