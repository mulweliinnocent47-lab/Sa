import "server-only";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

const BUCKET = "SA student";

const FOLDERS = [
  // grade 7
  "grade-7-Mathematics Literacy"
  // grade 8
];

// Separates folder and file name inside a slug. Same file name can exist in
// several folders (e.g. "Term 1.txt" in grade 7 and 8), so the slug must
// include the folder to stay unique.
const SLUG_SEPARATOR = "__";

/*
 * NOTE: unstable_cache() cannot be used here. createClient() reads the
 * request cookies, and Next.js does not allow cookies()/headers() inside a
 * cached function - that is what made the notes (and the whole protected
 * layout) crash. React's cache() de-duplicates the work within one request
 * instead, and the folders are listed in parallel so it stays fast.
 */
const getStorageFiles = cache(async () => {
  const supabase = await createClient();

  const results = await Promise.all(
    FOLDERS.map(async (folder) => {
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        // One bad folder should not take the whole notes page down.
        console.error(`Could not list folder "${folder}":`, error.message);
        return [];
      }

      return (data ?? [])
        .filter((file) => file?.name?.toLowerCase().endsWith(".txt"))
        .map((file) => ({ ...file, folder }));
    })
  );

  return results.flat();
});

export const getServerNotes = cache(async () => {
  const allFiles = await getStorageFiles();

  return allFiles.map((file) => {
    const slug = `${file.folder}${SLUG_SEPARATOR}${file.name}`;

    return {
      slug,
      title: file.name.replace(/\.txt$/i, ""),
      folder: file.folder,
      storagePath: `${file.folder}/${file.name}`,
      subject: file.folder.replace(/^grade-\d+-/, ""),
      grade: file.folder.match(/^grade-(\d+)-/)?.[1],
      minutes: Math.max(1, Math.round((file.metadata?.size ?? 4000) / 400)),
      summary: `Latest ${file.name}, free to download.`,
      src: `/api/notes/${encodeURIComponent(slug)}`,
      proOnly: false,
    };
  });
});

export async function getServerNote(slug) {
  const notes = await getServerNotes();

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    // keep the raw slug if it is not valid percent-encoding
  }

  return notes.find((note) => note.slug === decodedSlug) ?? null;
}

export { BUCKET, FOLDERS };
