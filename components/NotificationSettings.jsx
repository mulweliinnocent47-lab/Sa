"use client";
// Settings → Notifications. Turns Web Push on/off for this device.
import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Send } from "lucide-react";
import { useAuthUser } from "@/lib/useAuthUser";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// the VAPID key comes as base64url text; the browser wants bytes
function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function Toggle({ on, onClick, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

export function NotificationSettings() {
  const { loading: authLoading, user } = useAuthUser();
  const [support, setSupport] = useState("checking"); // checking | yes | no | ios-install
  const [permission, setPermission] = useState("default");
  const [endpoint, setEndpoint] = useState(null);
  const [prefs, setPrefs] = useState({ pref_daily: true, pref_weekly: true });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (!ok) {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      setSupport(ios ? "ios-install" : "no");
      return;
    }
    setSupport("yes");
    setPermission(Notification.permission);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setEndpoint(sub?.endpoint ?? null);
      if (sub) {
        const res = await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (json?.subscribed) setPrefs({ pref_daily: json.pref_daily, pref_weekly: json.pref_weekly });
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function enable() {
    setBusy(true); setMessage("");
    try {
      if (!PUBLIC_KEY) throw new Error("Push is not set up yet (missing NEXT_PUBLIC_VAPID_PUBLIC_KEY).");
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") throw new Error("Notifications are blocked. Allow them in your browser settings, then try again.");

      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY) }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Could not save the subscription.");
      setEndpoint(sub.endpoint);
      setMessage("Notifications are on for this device.");
    } catch (e) {
      setMessage(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true); setMessage("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEndpoint(null);
      setMessage("Notifications are off for this device.");
    } catch (e) {
      setMessage(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function savePref(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }));
    await fetch("/api/push/subscribe", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, [key]: value }),
    }).catch(() => {});
  }

  async function sendTest() {
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const json = await res.json().catch(() => null);
      setMessage(json?.ok ? "Test sent. It should appear in a few seconds." : json?.error || "Could not send the test.");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
  if (!user) {
    return <p className="text-sm text-muted-foreground">Log in to turn on notifications.</p>;
  }
  if (support === "checking") return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
  if (support === "no") {
    return <p className="text-sm text-muted-foreground">This browser does not support push notifications. Try Chrome on Android or Safari on iPhone (after adding SA Student to your Home Screen).</p>;
  }
  if (support === "ios-install") {
    return (
      <p className="text-sm text-muted-foreground">
        On iPhone, notifications only work from the installed app. Tap the Share button in Safari, choose <strong>Add to Home Screen</strong>, open SA Student from your Home Screen, then come back here.
      </p>
    );
  }

  const subscribed = !!endpoint && permission === "granted";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">Push notifications on this device</p>
          <p className="text-xs text-muted-foreground">
            {permission === "denied" ? "Blocked in your browser settings." : subscribed ? "You will get your study reminders." : "Get a study reminder once a day."}
          </p>
        </div>
        {subscribed ? (
          <button type="button" onClick={disable} disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <BellOff className="size-4" />} Turn off
          </button>
        ) : (
          <button type="button" onClick={enable} disabled={busy || permission === "denied"} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Turn on
          </button>
        )}
      </div>

      {subscribed && (
        <>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium">Daily study nudge</p>
              <p className="text-xs text-muted-foreground">One reminder at 17:00, nothing else.</p>
            </div>
            <Toggle on={prefs.pref_daily} onClick={() => savePref("pref_daily", !prefs.pref_daily)} label="Daily study nudge" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Weekly progress recap</p>
              <p className="text-xs text-muted-foreground">Every Sunday, before the weekly tasks reset.</p>
            </div>
            <Toggle on={prefs.pref_weekly} onClick={() => savePref("pref_weekly", !prefs.pref_weekly)} label="Weekly progress recap" />
          </div>
          <button type="button" onClick={sendTest} disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60">
            <Send className="size-4" /> Send me a test notification
          </button>
        </>
      )}

      {message && <p role="status" className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
