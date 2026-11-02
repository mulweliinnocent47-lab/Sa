import "server-only";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

const BUCKET = "SA student"

const FOLDERS = [
  
  "grade-12-Mathematics",
    "grade-12-Mathematics Literacy"
  
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
              
