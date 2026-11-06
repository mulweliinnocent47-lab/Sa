import Link from "next/link";
import { Bell, Heart, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, PageHeader } from "@/components/ui";
import { NotificationSettings } from "@/components/NotificationSettings";

export const metadata = { title: "Settings — SA Student" };

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Notifications and your account." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-bold"><Bell className="size-4 text-primary" /> Notifications</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">Reminders that actually change how you study. You can turn them off any time.</p>
          <NotificationSettings />
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 text-base font-bold"><UserRound className="size-4 text-primary" /> Account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Change your username, grade and school, or log out.</p>
            <Link href="/profile" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted">
              Open profile
            </Link>
          </Card>
          <Card className="bg-gold-soft">
            <h2 className="flex items-center gap-2 text-base font-bold"><Heart className="size-4 text-gold" /> Free for every student</h2>
            <p className="mt-1 text-sm text-muted-foreground">Notes, papers, memos, practice and the leaderboard are free. You only need an account to download files and to keep chatting with the AI.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
