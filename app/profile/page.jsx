import Link from "next/link";
import { Camera, LogOut, Settings } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, GhostButton, PageHeader, PrimaryButton, Stat } from "@/components/ui";
import { Flame, Trophy, BookOpen } from "lucide-react";

export const metadata = { title: "Profile — SA Student" };

// ── PLACEHOLDER DATA ── wire to the Supabase user + profile table
const USER = { name: "Student Name", email: "student@example.com", grade: "Grade 12", school: "School name", plan: "Free", initials: "SN" };
const BADGES = ["First paper", "7-day streak", "Quiz master"];

function Field({ id, label, value, type = "text" }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={id} type={type} defaultValue={value}
        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <PageHeader title="Profile" subtitle="Your details and achievements." />

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="space-y-4">
          <Card className="text-center">
            <div className="relative mx-auto grid size-24 place-items-center rounded-full bg-hero text-3xl font-bold text-primary-foreground">
              {USER.initials}
              <button type="button" aria-label="Change photo" className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm"><Camera className="size-4" /></button>
            </div>
            <p className="mt-4 text-lg font-bold">{USER.name}</p>
            <p className="text-sm text-muted-foreground">{USER.email}</p>
            <div className="mt-3 flex justify-center gap-2"><Badge tone="brand">{USER.grade}</Badge><Badge tone="gold">{USER.plan} plan</Badge></div>
          </Card>
          <Card>
            <p className="text-sm font-semibold">Badges</p>
            <div className="mt-3 flex flex-wrap gap-2">{BADGES.map((b) => <Badge key={b} tone="success">{b}</Badge>)}</div>
          </Card>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat icon={Flame} label="Streak" value="6 days" tone="gold" />
            <Stat icon={BookOpen} label="Resources read" value="32" />
            <Stat icon={Trophy} label="Sessions" value="14" tone="success" />
          </div>

          <Card>
            <p className="font-semibold">Personal details</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name" value={USER.name} />
              <Field id="email" label="Email" value={USER.email} type="email" />
              <Field id="grade" label="Grade" value={USER.grade} />
              <Field id="school" label="School" value={USER.school} />
            </div>
            <div className="mt-5 flex justify-end"><PrimaryButton>Save changes</PrimaryButton></div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <GhostButton href="/settings" icon={Settings}>Settings & plan</GhostButton>
            <GhostButton icon={LogOut} className="text-destructive">Log out</GhostButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
