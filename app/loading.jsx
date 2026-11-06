// Shown instantly while a page is loading, so navigation feels immediate.
export default function Loading() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading">
      <div className="h-16 border-b border-border bg-card/85" />
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="mt-6 h-56 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
