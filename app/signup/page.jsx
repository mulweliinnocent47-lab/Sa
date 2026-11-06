"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import Input from "@/components2/input.jsx";
import Button from "@/components2/button.jsx";
import { createClient } from "@/utils/supabase/client";
import { cleanUsername, USERNAME_RULE } from "@/lib/profileConfig";
import { safeNext } from "@/lib/safeNext";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => setQuery(window.location.search), []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const username = cleanUsername(name); // this is the name shown on the leaderboard
    if (!USERNAME_RULE.test(username)) return setError("Username must be 3-20 letters, numbers or underscores.");
    if (!email) return setError("Enter your email.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");

    setBusy(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: username, username } },
    });
    setBusy(false);
    if (err) return setError(err.message);

    // Email confirmation switched off in Supabase: we are already logged in
    if (data.session) {
      router.push(safeNext(new URLSearchParams(window.location.search).get("next")));
      router.refresh();
      return;
    }
    setNotice("Account created! Check your email to confirm it, then log in.");
  };

  return (
    <AppShell>
      <div className="flex justify-center py-6 md:py-12">
        <form onSubmit={handleSignUp} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          <h1 className="text-center text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">Join SA Student. It's free.</p>

          <Input must={true} logic={(e) => setName(e.target.value)} pro="Username" id="name" type="text" value="e.g. thabo_12 (shown on the leaderboard)" />
          <Input must={true} logic={(e) => setEmail(e.target.value)} pro="Email" id="email" type="email" value="Enter your email" />
          <Input must={true} logic={(e) => setPassword(e.target.value)} pro="Password" id="password" type="password" autoComplete="new-password" value="At least 6 characters" />
          <Input must={true} logic={(e) => setConfirm(e.target.value)} pro="Confirm password" id="confirm" type="password" autoComplete="new-password" value="Confirm password" />

          {error && <p role="alert" className="mb-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          {notice && (
            <p role="status" className="mb-2 rounded-lg bg-success-soft p-3 text-sm text-success">
              {notice}{" "}
              <Link href={`/login${query}`} className="font-semibold underline">Go to log in</Link>
            </p>
          )}

          <Button info={busy ? "Creating account…" : "Sign up"} type="submit" disabled={busy || !!notice} />

          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={`/login${query}`} className="font-semibold text-primary underline">Log in</Link>
            </p>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
