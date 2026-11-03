
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { subject, topic, time, level } = await request.json();

    if (!subject || !topic || !time || !level) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("planner")
      .insert({
        user_id: user.id,
        subject,
        topic,
        time,
        level,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, planner: data });

  } catch (error) {
    console.error("Planner error:", error);

    return NextResponse.json(
      { error: "Failed to create planner entry" },
      { status: 500 }
    );
  }
}
