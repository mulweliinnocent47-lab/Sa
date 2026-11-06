import Link from "next/link";
import { AuthLinks, DesktopNav, MobileNav } from "@/components/NavLinks";
import { XpToast } from "@/components/XpToast";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2" aria-label="SA Student home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={36} height={36} className="size-9 rounded-xl shadow-soft" />
            <span className="text-base font-bold tracking-tight">SA Student</span>
          </Link>
          <DesktopNav />
          <AuthLinks />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-16">{children}</main>
      <MobileNav />
      <XpToast />
    </div>
  );
}
