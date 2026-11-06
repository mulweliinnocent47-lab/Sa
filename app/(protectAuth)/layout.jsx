import { createClient } from "@/utils/supabase/server";
import { NoteProvider } from "@/components/Noteprovider.jsx";
import { getNotes } from "@/lib/notesHelper.js";
import { GetPapers } from "@/lib/paperServer.js";
import { GetMemos } from "@/lib/memoServer.js";

// The app is open to guests. Signing in is only required for downloads, practice
// sessions and AI messages after the free limit (see SignInPrompt).
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient();

  // getClaims() checks the login cookie locally, so it does not wait for a round trip to
  // Supabase like getUser() does. It only decides what the UI shows; every API route
  // that does something important still uses getUser().
  const [claims, NOTES, PAPERS, MEMOS] = await Promise.all([
    supabase.auth.getClaims().catch(() => ({ data: null })),
    getNotes(),
    GetPapers(),
    GetMemos(),
  ]);
  const isLoggedIn = !!claims?.data?.claims;

  return (
    <NoteProvider PAPERS={PAPERS} NOTES={NOTES} MEMOS={MEMOS} isLoggedIn={isLoggedIn}>
      {children}
    </NoteProvider>
  );
}
