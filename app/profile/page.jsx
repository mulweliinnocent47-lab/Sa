import Link from "next/link";
import { BookOpen, Download, Flame, LogOut, Settings, Sparkles, Star, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { Badge, Card, PageHeader, ProgressBar, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/authServer";
import { getOrCreateProfile } from "@/lib/profileServer";
import { getActivityDates, getMyXp, getPracticeResults } from "@/lib/xpServer";
import { computeStreak, levelProgress } from "@/lib/tasksConfig";

export const metadata = { title: "Profile — SA Student" };
export const dynamic = "force-dynamic";

function earnedBadges({ sessions, best, streak, xp }) {
  const b = [];
  if (sessions >= 1) b.push("First session");
  if (sessions >= 10) b.push("10 sessions");
  if (best >= 90) b.push("Sharp: 90%+");
  if (streak >= 3) b.push(`${streak}-day streak`);
  if (xp >= 100) b.push("100 XP club");
  if (xp >= 500) b.push("500 XP club");
  return b;
}

export default async function ProfilePage() {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return (
      <AppShell>
        <PageHeader title="Profile" subtitle="Your details and achievements." />
        <Card className="mx-auto max-w-md text-center">
          <Sparkles className="mx-auto size-6 text-gold" />
          <h2 className="mt-3 text-lg font-bold">Create your free profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">Save your progress, earn XP and join the leaderboard.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/signup?next=/profile" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Sign up</Link>
            <Link href="/login?next=/profile" className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium">Log in</Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  const [profile, xp, results, dates, downloads] = await Promise.all([
    getOrCreateProfile(supabase, user),
    getMyXp(supabase, user.id),
    getPracticeResults(supabase, user.id),
    getActivityDates(supabase, user.id),
    supabase.from("downloads").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const total = xp?.total ?? 0;
  const lvl = levelProgress(total);
  const sessions = results?.length ?? 0;
  const best = results?.reduce((m, r) => Math.max(m, r.percent), 0) ?? 0;
  const streak = computeStreak(dates);
  const badges = earnedBadges({ sessions, best, streak, xp: total });
  const username = profile?.username ?? user.email?.split("@")[0] ?? "student";

  return (
    <AppShell>
      <PageHeader title="Profile" subtitle="Your details and achievements." />

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="space-y-4">
          <Card className="text-center">
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-hero text-3xl font-bold uppercase text-primary-foreground">
              {username.charAt(0)}
            </div>
            <p className="mt-4 text-lg font-bold">{profile?.full_name || username}</p>
            <p className="text-sm text-muted-foreground">@{username}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {profile?.grade && <Badge tone="brand">Grade {profile.grade}</Badge>}
              <Badge tone="gold">Level {lvl.level}</Badge>
            </div>
            <div className="mt-4 text-left">
              <div className="mb-1.5 flex justify-between text-xs font-medium"><span>{total} XP</span><span className="text-muted-foreground">{lvl.into}/{lvl.need} to next level</span></div>
              <ProgressBar value={lvl.pct} tone="gold" />
            </div>
          </Card>
          <Card>
            <p className="text-sm font-semibold">Badges</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.length ? badges.map((b) => <Badge key={b} tone="success"><Star className="size-3" /> {b}</Badge>) : (
                <p className="text-sm text-muted-foreground">Finish a practice session to earn your first badge.</p>
              )}
            </div>
          </Card>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat icon={Flame} label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} tone="gold" />
            <Stat icon={Download} label="Downloads" value={downloads?.count ?? 0} />
            <Stat icon={Trophy} label="Sessions" value={sessions} tone="success" />
          </div>

          <Card>
            <p className="font-semibold">Personal details</p>
            <div className="mt-4">
              <ProfileForm initial={profile} email={user.email} />
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link href="/leaderboard" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted"><Trophy className="size-4" /> Leaderboard</Link>
            <Link href="/settings" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted"><Settings className="size-4" /> Settings &amp; notifications</Link>
            {/* plain <a>: logging out is a full page navigation, never prefetched */}
            <a href="/logout" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-destructive hover:bg-muted"><LogOut className="size-4" /> Log out</a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
