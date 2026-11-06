"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, CalendarDays, ClipboardCheck, Home, Library, LineChart,
  MessageSquareText, MoreHorizontal, Settings, Trophy, User, X, LogIn, UserPlus,
} from "lucide-react";
import { AUTH_ROUTES, DESKTOP_HIDDEN, NAV_EXTRA_PREFIXES, NAV_ROUTES, isActivePath } from "@/lib/routes";
import { useAuthUser } from "@/lib/useAuthUser";

const ICONS = {
  "/": Home,
  "/subjects": BookOpen,
  "/resources": Library,
  "/exam-centre": ClipboardCheck,
  "/ai-tutor": MessageSquareText,
  "/planner": CalendarDays,
  "/progress": LineChart,
  "/leaderboard": Trophy,
  "/profile": User,
  "/settings": Settings,
};

// The existing /practice page is the AI chat, so it counts as "AI Tutor".
function active(pathname, href) {
  if (href === "/ai-tutor" && pathname === "/practice") return true;
  return isActivePath(pathname, href, NAV_EXTRA_PREFIXES[href] ?? []);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 lg:flex">
      {NAV_ROUTES.filter((r) => !DESKTOP_HIDDEN.includes(r.href)).map(({ href, label }) => {
        const Icon = ICONS[href];
        const on = active(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
              on ? "bg-brand-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Top-right corner: the user's name when signed in, Log in / Sign up otherwise.
// (There is no Log out here any more: it lives on the Profile page.)
export function AuthLinks() {
  const { loading, user, name } = useAuthUser();
  const pathname = usePathname();

  return (
    <div className="ml-auto flex items-center gap-2 lg:ml-3">
      {loading ? (
        <span className="h-9 w-24 animate-pulse rounded-lg bg-muted" aria-hidden="true" />
      ) : user ? (
        <Link
          href="/profile"
          aria-label={`Open profile of ${name}`}
          className={`inline-flex h-9 max-w-[11rem] items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
            pathname === "/profile" ? "border-primary bg-brand-soft text-primary" : "border-border hover:bg-muted"
          }`}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-hero text-xs font-bold uppercase text-primary-foreground">
            {name.charAt(0)}
          </span>
          <span className="truncate">{name}</span>
        </Link>
      ) : (
        AUTH_ROUTES.map(({ href, label }) => {
          const on = isActivePath(pathname, href);
          const primary = href === "/signup";
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                on
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : primary
                  ? "border border-primary text-primary hover:bg-brand-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })
      )}
    </div>
  );
}

const BOTTOM = ["/", "/subjects", "/resources", "/ai-tutor"];

export function MobileNav() {
  const pathname = usePathname();
  const { loading, user } = useAuthUser();
  const [open, setOpen] = useState(false);
  const bottom = NAV_ROUTES.filter((r) => BOTTOM.includes(r.href));
  const more = NAV_ROUTES.filter((r) => !BOTTOM.includes(r.href));
  const showAuth = !loading && !user;
  const moreActive =
    more.some((r) => active(pathname, r.href)) ||
    (showAuth && AUTH_ROUTES.some((r) => isActivePath(pathname, r.href)));

  const item = (on) =>
    `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${on ? "text-primary" : "text-muted-foreground"}`;
  const tile = (on) =>
    `flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium ${on ? "border-primary bg-brand-soft text-primary" : "border-border"}`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More pages">
          <button aria-label="Close menu" className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-card p-4 pb-6 shadow-float">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">More pages</p>
              <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {more.map(({ href, label }) => {
                const Icon = ICONS[href];
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(pathname, href) ? "page" : undefined} className={tile(active(pathname, href))}>
                    <Icon className="size-4" />{label}
                  </Link>
                );
              })}
              {showAuth &&
                AUTH_ROUTES.map(({ href, label }) => {
                  const Icon = href === "/login" ? LogIn : UserPlus;
                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={isActivePath(pathname, href) ? "page" : undefined} className={tile(isActivePath(pathname, href))}>
                      <Icon className="size-4" />{label}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      )}
      <nav aria-label="Main mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {bottom.map(({ href, label }) => {
            const Icon = ICONS[href];
            const on = active(pathname, href);
            return (
              <Link key={href} href={href} aria-current={on ? "page" : undefined} className={item(on)}>
                <Icon className="size-5" />{label}
              </Link>
            );
          })}
          <button type="button" onClick={() => setOpen(true)} className={item(moreActive)} aria-expanded={open}>
            <MoreHorizontal className="size-5" />More
          </button>
        </div>
      </nav>
    </>
  );
}
