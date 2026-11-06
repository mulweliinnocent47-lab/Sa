// Served at /manifest.webmanifest — makes SA Student installable like an app.
export default function manifest() {
  return {
    name: "SA Student",
    short_name: "SA Student",
    description: "NSC past papers, study notes and AI practice for South African students.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#012066",
    theme_color: "#012066",
    lang: "en-ZA",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Exam Centre", url: "/exam-centre", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Leaderboard", url: "/leaderboard", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "AI Tutor", url: "/ai-tutor", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
