
import "server-only";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

const BUCKET = "SA Memo";

const FOLDERS = ["grade-12-memos"];

const getCachedMemos = cache(async () => {
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
      console.error(`Error loading ${folder}:`, error.message);
      continue;
    }

    const folderPapers = (files ?? [])
      .filter((file) =>
        file.name?.toLowerCase().endsWith(".pdf")
      )
      .map((file) => {
        const filePath = `${folder}/${file.name}`;
        const title = file.name.replace(/\.pdf$/i, "");

        return {
          id: `${folder}-${file.name}`,
          subject: "", // Extract this from the filename
          grade: 12,
          title,
          province: "Gauteng",
          session: "November",
          pages: 3,
          year: 2025,
          pro: false,
          path: filePath,
        };
      });

    papers.push(...folderPapers);
  }

  return papers;
});

export async function GetMemos() {
  return getCachedMemos();
}
