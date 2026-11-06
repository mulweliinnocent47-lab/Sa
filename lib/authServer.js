// lib/authServer.js  (server only)
// One Supabase client + user per request. React's cache() means that even if three
// components call getCurrentUser(), Supabase is only asked once.
import "server-only";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user: user ?? null };
});
