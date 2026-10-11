import "server-only";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

const BUCKET = "SA student"

const FOLDERS = [
  // grade 7
  "grade-7-Geography",
  "grade-7-Life Orientation",
  "grade-7-Mathematics",
  "grade-7-History",
  "grade-7-EMS",
  "grade-7-English",
  "grade-7-Technology",
  "grade-7-Natural Science",
  "grade-7-Creative Arts",
  "grade-7-Afrikaans",

  // grade 8
  "grade-8-Geography",
  "grade-8-Life Orientation",
  "grade-8-Mathematics",
  "grade-8-History",
  "grade-8-EMS",
  "grade-8-English",
  "grade-8-Technology",
  "grade-8-Natural Science",
  "grade-8-Afrikaans",
];

export async function GetSubject(){
  const fileData = []
  const supabase = await createClient()
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
}
              
