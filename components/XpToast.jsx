"use client";
// Little "+20 XP" pop-ups. Listens for the event sent by reportXp() in lib/xpClient.js
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function XpToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onXp(e) {
      const { gained, awarded = [] } = e.detail ?? {};
      if (!gained) return;
      const id = Date.now() + Math.random();
      const text = awarded.length === 1 ? awarded[0].title : `${awarded.length} tasks completed`;
      setToasts((t) => [...t, { id, gained, text }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
    }
    window.addEventListener("sa:xp", onXp);
    return () => window.removeEventListener("sa:xp", onXp);
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-gold bg-card px-4 py-3 shadow-float">
          <span className="grid size-9 place-items-center rounded-full bg-gold-soft text-gold"><Sparkles className="size-4" /></span>
          <div>
            <p className="text-sm font-bold">+{t.gained} XP</p>
            <p className="text-xs text-muted-foreground">{t.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
