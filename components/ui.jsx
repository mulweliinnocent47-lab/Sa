// Small shared building blocks for the page layouts.
// No hooks, so they work in both Server and Client Components.
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export function titleCase(slug = "") {
  return decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TONES = {
  brand: "bg-brand-soft text-primary",
  gold: "bg-gold-soft text-foreground",
  success: "bg-success-soft text-success",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-destructive/10 text-destructive",
};

export function PageHeader({ title, subtitle, back, action }) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Card({ className = "", children }) {
  return <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

export function SectionTitle({ title, href, linkLabel = "See all" }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {href && <Link href={href} className="text-sm font-medium text-primary">{linkLabel}</Link>}
    </div>
  );
}

export function Badge({ tone = "muted", children }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

export function IconBox({ icon: Icon, tone = "brand" }) {
  return (
    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
      <Icon className="size-5" />
    </span>
  );
}

export function Stat({ icon, label, value, hint, tone = "brand" }) {
  return (
    <Card className="flex items-center gap-4">
      <IconBox icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}

export function ProgressBar({ value = 0, tone = "primary" }) {
  const color = { primary: "bg-primary", success: "bg-success", gold: "bg-gold", cyan: "bg-cyan" }[tone];
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Chip({ active, children }) {
  return (
    <button type="button" className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
      {children}
    </button>
  );
}

export function ChipRow({ children }) {
  return <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">{children}</div>;
}

export function SearchBar({ placeholder = "Search…" }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input type="search" placeholder={placeholder} aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" />
    </div>
  );
}

export function PrimaryButton({ href, children, icon: Icon, className = "" }) {
  const cls = `inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 ${className}`;
  const inner = <>{Icon && <Icon className="size-4" />}{children}</>;
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button type="button" className={cls}>{inner}</button>;
}

export function GhostButton({ href, children, icon: Icon, className = "" }) {
  const cls = `inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted ${className}`;
  const inner = <>{Icon && <Icon className="size-4" />}{children}</>;
  return href ? <Link href={href} className={cls}>{inner}</Link> : <button type="button" className={cls}>{inner}</button>;
}
