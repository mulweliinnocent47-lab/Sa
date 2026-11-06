"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import Input from "@/components2/input.jsx";
import Button from "@/components2/button.jsx";
import { createClient } from "@/utils/supabase/client";
import { safeNext } from "@/lib/safeNext";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState(""); // "?next=/leaderboard" (read after mount so server and browser HTML match)

  useEffect(() => setQuery(window.location.search), []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter your email and password.");

    setBusy(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setBusy(false);
      return setError(err.message === "Invalid login credentials" ? "Wrong email or password." : err.message);
    }
    // Go back to the page that asked for sign-in
    router.push(safeNext(new URLSearchParams(window.location.search).get("next")));
    router.refresh();
  };

  return (
    <AppShell>
      <div className="flex justify-center py-6 md:py-12">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          <h1 className="text-center text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">Log in to continue studying.</p>

          <Input must={true} pro="Email" id="email" type="email" logic={(e) => setEmail(e.target.value)} value="Enter your email" />
          <Input must={true} pro="Password" id="password" type="password" logic={(e) => setPassword(e.target.value)} value="Enter your password" />

          {error && <p role="alert" className="mb-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <Button info={busy ? "Logging in…" : "Log in"} type="submit" disabled={busy} />

          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href={`/signup${query}`} className="font-semibold text-primary underline">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
