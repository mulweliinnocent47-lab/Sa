import { createClient } from "@/utils/supabase/server";
import { getOrCreateProfile, saveProfile } from "@/lib/profileServer";

export const dynamic = "force-dynamic";

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET /api/profile  -> the signed-in user's profile (created on first call)
export async function GET() {
  const { supabase, user } = await currentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const profile = await getOrCreateProfile(supabase, user);
  return Response.json({ profile });
}

// PUT /api/profile  body: { username, full_name, grade, school, province }
export async function PUT(request) {
  const { supabase, user } = await currentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const result = await saveProfile(supabase, user, body);
  if (!result.ok) return Response.json({ error: result.error, errors: result.errors }, { status: result.status });
  return Response.json({ profile: result.profile });
}
