// After login/signup we send people back to where they came from.
// Only same-site paths are allowed ("/leaderboard" yes, "https://evil.com" or "//evil.com" no).
export function safeNext(raw, fallback = "/") {
  return typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}
