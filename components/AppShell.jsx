import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthLinks, DesktopNav, MobileNav } from "@/components/NavLinks";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-hero text-primary-foreground shadow-soft">
              <Sparkles className="size-4" />
            </span>
            <span className="text-base font-bold tracking-tight">SA Student</span>
          </Link>
          <DesktopNav />
          <AuthLinks />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-16">{children}</main>
      <MobileNav />
    </div>
  );
}
