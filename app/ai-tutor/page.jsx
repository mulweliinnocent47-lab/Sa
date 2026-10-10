import { Bot, Paperclip, Plus, Send, Sparkles, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Chip, ChipRow } from "@/components/ui";

export const metadata = { title: "AI Tutor — SA Student" };

// ── PLACEHOLDER DATA ── wire to your chat API / history
const MODES = ["Explain", "Brainstorm", "Quiz me", "Mark my answer"];
const HISTORY = ["Quadratic equations help", "Essay on load shedding", "Photosynthesis quiz", "Study plan for Friday"];
const MESSAGES = [
  { role: "ai", text: "Hi! I'm your AI Tutor. Pick a mode, choose a subject, and ask me anything." },
  { role: "user", text: "Can you explain how to solve a quadratic equation?" },
  { role: "ai", text: "Sure. Start by writing it as ax² + bx + c = 0. Then you can factorise, complete the square or use the quadratic formula. Want me to show an example?" },
];
const STARTERS = ["Explain photosynthesis simply", "Quiz me on trigonometry", "Give me a 5-step study plan"];

export default function AiTutorPage() {
  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Past chats (hidden on mobile) */}
        <aside className="hidden rounded-2xl border border-border bg-card p-3 lg:block">
          <button type="button" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground">
            <Plus className="size-4" /> New chat
          </button>
          <p className="mb-2 mt-5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent</p>
          <ul className="space-y-1">
            {HISTORY.map((h, i) => (
              <li key={h}><button type="button" className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm ${i === 0 ? "bg-brand-soft font-medium text-primary" : "text-muted-foreground hover:bg-muted"}`}>{h}</button></li>
            ))}
          </ul>
        </aside>

        {/* Chat */}
        <section className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-card shadow-sm lg:col-span-3">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <span className="grid size-9 place-items-center rounded-xl bg-hero text-primary-foreground"><Sparkles className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">AI Tutor</p>
              <p className="text-xs text-muted-foreground">Subject: Mathematics</p>
            </div>
          </div>
          <div className="border-b border-border px-4 py-3"><ChipRow>{MODES.map((m, i) => <Chip key={m} active={i === 0}>{m}</Chip>)}</ChipRow></div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {MESSAGES.map((m, i) => {
              const mine = m.role === "user";
              return (
                <div key={i} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${mine ? "bg-primary text-primary-foreground" : "bg-brand-soft text-primary"}`}>
                    {mine ? <User className="size-4" /> : <Bot className="size-4" />}
                  </span>
                  <p className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"}`}>{m.text}</p>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2 pt-2">
              {STARTERS.map((s) => <button key={s} type="button" className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">{s}</button>)}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <button type="button" aria-label="Attach" className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Paperclip className="size-4" /></button>
            <input placeholder="Ask your tutor anything…" aria-label="Message" className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" />
            <button type="button" aria-label="Send" className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Send className="size-4" /></button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
