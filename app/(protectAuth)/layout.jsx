import { createClient } from "@/utils/supabase/server";
import { NoteProvider } from "@/components/Noteprovider.jsx";
import { getNotes } from "@/lib/notesHelper.js";
import { GetPapers } from "@/lib/paperServer.js";
import { GetMemos } from "@/lib/memoServer.js";

// The app is open to guests. Signing in is only required for AI messages
// after the free limit and for downloads (see SignInPrompt).
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [NOTES, PAPERS, MEMOS] = await Promise.all([getNotes(), GetPapers(), GetMemos()]);

  return (
    <NoteProvider PAPERS={PAPERS} NOTES={NOTES} MEMOS={MEMOS} isLoggedIn={!!user}>
      {children}
    </NoteProvider>
  );
}
