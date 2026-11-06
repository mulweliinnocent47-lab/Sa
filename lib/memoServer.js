import "server-only";
import { cache } from "react";
import { listFolder } from "@/lib/storageCache";

const BUCKET = "SA Memo";

const FOLDERS = ["grade-12-memos"];

const getCachedMemos = cache(async () => {
  const perFolder = await Promise.all(
    FOLDERS.map(async (folder) => {
      const files = await listFolder(BUCKET, folder);

      return files
        .filter((file) => file.name?.toLowerCase().endsWith(".pdf"))
        .map((file) => ({
          id: `${folder}-${file.name}`,
          subject: "", // Extract this from the filename
          grade: 12,
          title: file.name.replace(/\.pdf$/i, ""),
          province: "Gauteng",
          session: "November",
          pages: 3,
          year: 2025,
          pro: false,
          path: `${folder}/${file.name}`,
        }));
    })
  );

  return perFolder.flat();
});

export async function GetMemos() {
  return getCachedMemos();
}
