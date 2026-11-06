import { redirect } from "next/navigation";

// Old links like /resources/<note-slug> now go straight to the real note.
export default async function ResourceRedirect({ params }) {
  const { slug } = await Promise.resolve(params);
  redirect(`/notes/${encodeURIComponent(slug)}`);
}
