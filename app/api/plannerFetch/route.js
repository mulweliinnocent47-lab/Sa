
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("planning")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { data, message: "success" },
    { status: 200 }
  );
}
