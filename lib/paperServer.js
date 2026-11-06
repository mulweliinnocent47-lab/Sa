import "server-only";
import { cache } from "react";
import { listFolder, publicUrl } from "@/lib/storageCache";

const BUCKET = "SA PDF";

const FOLDERS = [
  "grade-12-Mathematics/sequences and series",
  "grade-12-Mathematics/finance, growth and decay",
  "grade-12-Mathematics/differential calculus",
  "grade-12-Mathematics/counting principle and probability",
  "grade-12-Mathematics/algebra equations and inequalities",
];

const getCachedPapers = cache(async () => {
  // all folders at once instead of one after the other
  const perFolder = await Promise.all(
    FOLDERS.map(async (folder) => {
      const files = await listFolder(BUCKET, folder);

      return files
        .filter((file) => file.name.toLowerCase().endsWith(".pdf"))
        .map((file) => {
          const filePath = `${folder}/${file.name}`; // full path inside Supabase Storage
          const title = file.name.replace(/\.pdf$/i, "");
          const subject = folder.replace(/^grade-\d+-/, "");
          const grade = folder.match(/^grade-(\d+)-/)?.[1];

          return {
            id: `${subject}-${title}-${grade}`,
            subject,
            grade,
            title,
            province: "Gauteng",
            session: "June",
            pages: 3,
            year: 2024,
            url: publicUrl(BUCKET, filePath),
            path: filePath, // used by /api/download
          };
        });
    })
  );

  return perFolder.flat();
});

export async function GetPapers() {
  return getCachedPapers();
}
