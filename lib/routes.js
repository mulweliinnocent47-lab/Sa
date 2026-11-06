// Single source of truth for every page in the app.
export const NAV_ROUTES = [
  { href: "/", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/resources", label: "Resources" },
  { href: "/exam-centre", label: "Exam Centre" },
  { href: "/ai-tutor", label: "AI Tutor" },
  { href: "/planner", label: "Planner" },
  { href: "/progress", label: "Progress" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

// Shown in the top bar only for signed-out visitors.
// (Log out now lives on the Profile page.)
export const AUTH_ROUTES = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

// Pages that appear in the desktop top bar. Profile is reached through the
// username chip and Settings through Profile, so the bar does not overflow.
export const DESKTOP_HIDDEN = ["/profile", "/settings"];

// Which URL prefixes should light up which nav item
export function isActivePath(pathname, href, extra = []) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return [href, ...extra].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export const NAV_EXTRA_PREFIXES = {
  "/resources": ["/notes", "/papers", "/memo", "/video"],
  "/exam-centre": ["/practice/"],
  "/ai-tutor": [],
};
