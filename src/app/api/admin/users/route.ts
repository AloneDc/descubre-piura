import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Admin list error:", error);
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(data.users);
}
