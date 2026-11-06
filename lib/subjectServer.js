import "server-only";
import { listFolder } from "@/lib/storageCache";
import { cache } from "react";

const BUCKET = "SA student"

const FOLDERS = [
  "grade-12-Mathematics/sequences and series",
   "grade-12-Mathematics/finance, growth and decay",
    "grade-12-Mathematics/differential calculus",
     "grade-12-Mathematics/counting principle and probability",
      "grade-12-Mathematics/algebra equations and inequalities",
];

export const GetSubject = cache(async () => {
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
