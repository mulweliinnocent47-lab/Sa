"use client";
// Renders the profile form from PROFILE_FIELDS in lib/profileConfig.js and saves it to /api/profile.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PROFILE_FIELDS } from "@/lib/profileConfig";
import { createClient } from "@/utils/supabase/client";

const input =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25";

export function ProfileForm({ initial, email }) {
  const router = useRouter();
  const [values, setValues] = useState(() =>
    Object.fromEntries(PROFILE_FIELDS.map((f) => [f.column, initial?.[f.column] ?? ""]))
  );
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const set = (column, value) => setValues((v) => ({ ...v, [column]: value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setErrors(json?.errors ?? {});
        throw new Error(json?.error || "Could not save your profile.");
      }
      // keep the name in the top bar in sync (it is read from the login session)
      await createClient().auth.updateUser({ data: { username: json.profile.username } }).catch(() => {});
      setValues((v) => ({ ...v, username: json.profile.username }));
      setMessage({ type: "ok", text: "Profile saved." });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {PROFILE_FIELDS.map((f) => (
          <div key={f.column} className={f.column === "username" ? "sm:col-span-2" : ""}>
            <label htmlFor={`pf-${f.column}`} className="mb-1.5 block text-sm font-medium">{f.label}</label>
            {f.type === "select" ? (
              <select id={`pf-${f.column}`} value={values[f.column]} onChange={(e) => set(f.column, e.target.value)} className={input}>
                <option value="">Select…</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>{typeof o === "number" ? `Grade ${o}` : o}</option>
                ))}
              </select>
            ) : (
              <input
                id={`pf-${f.column}`}
                type="text"
                value={values[f.column]}
                onChange={(e) => set(f.column, e.target.value)}
                maxLength={f.max}
                required={f.required}
                autoComplete="off"
                aria-invalid={!!errors[f.column]}
                className={input}
              />
            )}
            {errors[f.column] ? (
              <p className="mt-1 text-xs text-destructive">{errors[f.column]}</p>
            ) : f.hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>
            ) : null}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="pf-email" className="mb-1.5 block text-sm font-medium">Email</label>
          <input id="pf-email" type="email" value={email ?? ""} readOnly disabled className={`${input} opacity-70`} />
        </div>
      </div>

      {message.text && (
        <p role="status" className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm ${message.type === "ok" ? "bg-success-soft text-success" : "bg-destructive/10 text-destructive"}`}>
          {message.type === "ok" && <CheckCircle2 className="size-4 shrink-0" />} {message.text}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {busy && <Loader2 className="size-4 animate-spin" />} Save changes
        </button>
      </div>
    </form>
  );
}
