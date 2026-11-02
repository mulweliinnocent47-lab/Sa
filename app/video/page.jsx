"use client";

// app/(protectAuth)/videos/page.jsx
import { useEffect, useMemo, useState } from "react";
import { Lock, PlayCircle, Search, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, Chip, ChipRow, PageHeader } from "@/components/ui";

// ── PLACEHOLDER DATA ── `youtubeId` is the part after v= in a YouTube link.
const VIDEOS = [
  { id: "v1", title: "Photosynthesis explained", subject: "Life Sciences", grade: 10, minutes: 11, youtubeId: "dQw4w9WgXcQ", pro: true },
  { id: "v2", title: "Differentiation from first principles", subject: "Mathematics", grade: 12, minutes: 14, youtubeId: "dQw4w9WgXcQ", pro: false },
  { id: "v3", title: "Sequences and series: the full recap", subject: "Mathematics", grade: 12, minutes: 18, youtubeId: "dQw4w9WgXcQ", pro: false },
  { id: "v4", title: "Newton's laws in 10 minutes", subject: "Physical Sciences", grade: 11, minutes: 10, youtubeId: "dQw4w9WgXcQ", pro: true },
];

// Set to the user's real tier (e.g. from your profile/auth data) when you have it.
const USER_IS_PRO = false;

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Close video"
          onClick={onClose}
          className="absolute -top-10 right-0 rounded-lg p-1.5 text-white hover:bg-white/10"
        >
          <X className="size-5" />
        </button>
        <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-float">
          <iframe
            className="size-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-white">{video.title}</p>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [playing, setPlaying] = useState(null);

  const subjects = useMemo(() => ["All", ...new Set(VIDEOS.map((v) => v.subject))], []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VIDEOS.filter((v) => {
      const text = `${v.title} ${v.subject} grade ${v.grade}`.toLowerCase();
      return (subject === "All" || v.subject === subject) && (!q || text.includes(q));
    });
  }, [query, subject]);

  return (
    <AppShell>
      <PageHeader
        back={{ href: "/resources", label: "All resources" }}
        title="Videos"
        subtitle="Short video lessons to help you understand the tricky topics."
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos"
          aria-label="Search videos"
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="mt-3">
        <ChipRow>
          {subjects.map((s) => (
            <Chip key={s} active={subject === s} onClick={() => setSubject(s)}>{s}</Chip>
          ))}
        </ChipRow>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((v) => {
          const locked = v.pro && !USER_IS_PRO;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => !locked && setPlaying(v)}
              disabled={locked}
              className="group text-left disabled:cursor-not-allowed"
            >
              <Card className="h-full overflow-hidden !p-0 transition-shadow group-hover:shadow-md">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className={`size-full object-cover ${locked ? "opacity-40 grayscale" : ""}`}
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    {locked ? (
                      <Lock className="size-8 text-foreground" />
                    ) : (
                      <PlayCircle className="size-12 text-white drop-shadow-lg transition-transform group-hover:scale-110" />
                    )}
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                    {v.minutes} min
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">{v.title}</h3>
                    {v.pro ? <Badge tone="gold"><Lock className="size-3" /> Pro</Badge> : <Badge tone="success">Free</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{v.subject} · Grade {v.grade}</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {results.length === 0 && (
        <div className="py-16 text-center">
          <PlayCircle className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No videos match your search.</p>
        </div>
      )}

      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}
    </AppShell>
  );
}
