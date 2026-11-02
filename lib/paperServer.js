import "server-only";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

const BUCKET = "SA PDF";

const FOLDERS = [
  "grade-12-Mathematics/sequences and series",
   "grade-12-Mathematics/finance, growth and decay",
    "grade-12-Mathematics/differential calculus",
     "grade-12-Mathematics/counting principle and probability",
      "grade-12-Mathematics/algebra equations and inequalities",
];

const getCachedPapers = cache(
  async () => {
    const supabase = await createClient();

    const papers = [];

    for (const folder of FOLDERS) {
      const { data: files, error } = await supabase.storage
        .from(BUCKET)
        .list(folder, {
          limit: 100,
          sortBy: {
            column: "name",
            order: "asc",
          },
        });

      if (error) {
        console.error(`Error loading ${folder}:`, error);
        continue;
      }

      const folderPapers = files
        .filter((file) =>
          file.name.toLowerCase().endsWith(".pdf")
        )
        .map((file) => {
          // Full path inside Supabase Storage
          const filePath = `${folder}/${file.name}`;

          // Public URL
          const { data } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(filePath);

          // Remove .pdf
          const title = file.name.replace(/\.pdf$/i, "");

          // Get subject from folder
          const subject = folder.replace(
            /^grade-\d+-/,
            ""
          );

          // Get grade from folder
          const grade = folder.match(
            /^grade-(\d+)-/
          )?.[1];

          return {
            id: `${subject}-${title}-${grade}`,

            subject,

            grade,

            title,

            province: "Gauteng",

            session: "June",

            pages: 3,

            year: 2024,

            url: data.publicUrl,

            // Used by /api/download
            path: filePath,
          };
        });

      papers.push(...folderPapers);
    }

    return papers;
  }
);

export async function GetPapers() {
  return getCachedPapers();
}
