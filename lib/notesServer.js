import "server-only";

import { cache } from "react";
import { listFolder } from "@/lib/storageCache";

const BUCKET = "SA student";

const FOLDERS = [
  "grade-12-Mathematics/sequences and series",
   "grade-12-Mathematics/finance, growth and decay",
    "grade-12-Mathematics/differential calculus",
     "grade-12-Mathematics/counting principle and probability",
      "grade-12-Mathematics/algebra equations and inequalities",
];
const Folder2 = [
  ...new Set(
    FOLDERS.map((e) =>
      e.split("/")[0].replace(/^grade-\d+-/, "")
    )
  )
];
// Separates folder and file name inside a slug. Same file name can exist in
// several folders (e.g. "Term 1.txt" in grade 7 and 8), so the slug must
// include the folder to stay unique.
const SLUG_SEPARATOR = "__";

/*
 * Folder listings are cached for 10 minutes for every visitor (lib/storageCache.js),
 * and React's cache() de-duplicates the work inside one request. The folders are
 * listed in parallel.
 */
const getStorageFiles = cache(async () => {
  const results = await Promise.all(
    FOLDERS.map(async (folder) => {
      const files = await listFolder(BUCKET, folder);
      return files
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
    const topic = file.folder.split("/")[1]
    return {
      slug,
      title: file.name.replace(/\.txt$/i, ""),
      folder: file.folder,
      storagePath: `${file.folder}/${file.name}`,
      subject: file.folder.split("/")[0].replace(/^grade-\d+-/, ""),
      grade: file.folder.match(/^grade-(\d+)-/)?.[1],
      minutes: Math.max(1, Math.round((file.metadata?.size ?? 4000) / 400)),
      summary: `Latest ${topic}, free to download.`,
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

export { BUCKET, Folder2 };
