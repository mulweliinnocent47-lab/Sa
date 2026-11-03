import "server-only";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

const BUCKET = "SA Memo";

const FOLDERS = [
  "grade-12-memo"
];

const getCachedMemos = cache(
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
            session: "November",
            pages: 3,
            year: 2025,
            url: data.publicUrl,
            pro:false,
            path: filePath,
    
        });

      papers.push(...folderPapers);
    }

    return papers;
  }
);

export async function GetMemos() {
  return getCachedMemos();
}
