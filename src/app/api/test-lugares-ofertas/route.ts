import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { districtId } = await req.json();

  const [placesRes, offersRes] = await Promise.all([
    supabase.from("places").select("*").eq("district_id", districtId),
    supabase
      .from("offers")
      .select("*")
      .eq("district_id", districtId)
      .eq("is_active", true),
  ]);

  return NextResponse.json({
    places: placesRes.data || [],
    offers: offersRes.data || [],
    error: placesRes.error || offersRes.error || null,
  });
}
