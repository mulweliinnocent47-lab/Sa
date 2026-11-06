// lib/xpClient.js  (browser only)
// After any API call that can earn XP, pass its result here to show the "+XP" toast.
//   const json = await res.json();  reportXp(json.xp ?? json);
export function reportXp(result) {
  if (typeof window === "undefined" || !result || !result.gained) return;
  window.dispatchEvent(new CustomEvent("sa:xp", { detail: result }));
}

/** Tells the server the signed-in student just got an AI answer (counts towards the daily AI task). */
export async function trackAiMessage() {
  try {
    const res = await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ai_message" }),
    });
    reportXp(await res.json());
  } catch {
    // XP is a bonus: never let it break the chat
  }
}
