import { PlayCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Videos — SA Student" };

export default function VideosPage() {
  return (
    <AppShell>
      <PageHeader back={{ href: "/resources", label: "All resources" }} title="Videos" subtitle="Short video lessons for the trickiest topics." />
      <Card className="mx-auto max-w-md text-center">
        <PlayCircle className="mx-auto size-10 text-primary" />
        <h2 className="mt-3 text-lg font-bold">Coming soon</h2>
        <p className="mt-1 text-sm text-muted-foreground">We're getting the video lessons ready. Check back soon.</p>
      </Card>
    </AppShell>
  );
}
