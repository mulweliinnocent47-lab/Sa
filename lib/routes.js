// Single source of truth for every page in the app.
// Nav, placeholders and the README all read from here.
export const NAV_ROUTES = [
  { href: "/", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/resources", label: "Resources" },
  { href: "/exam-centre", label: "Exam Centre" },
  { href: "/ai-tutor", label: "AI Tutor" },
  { href: "/planner", label: "Planner" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export const AUTH_ROUTES = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

// Placeholder values used only so dynamic routes have a clickable link.
export const SAMPLE_PARAMS = {
  subject: "mathematics",
  resource: "sample-resource",
  practice: "sample-session",
};

// Which URL prefixes should light up which nav item
// (so /subjects/mathematics keeps "Subjects" highlighted, etc.).
export function isActivePath(pathname, href, extra = []) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return [href, ...extra].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// Existing pages that belong to a nav section.
export const NAV_EXTRA_PREFIXES = {
  "/resources": ["/notes", "/papers"],
  "/exam-centre": ["/practice/"],
  "/ai-tutor": [],
};
