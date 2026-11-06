"use client";
// Reads the signed-in user from the session cookie. No network call, so the top bar is instant.
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { displayNameFromUser } from "@/lib/profileConfig";

export function useAuthUser() {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    const set = (session) => alive && setState({ loading: false, user: session?.user ?? null });

    supabase.auth.getSession().then(({ data }) => set(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => set(session));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { ...state, name: state.user ? displayNameFromUser(state.user) : null };
}
