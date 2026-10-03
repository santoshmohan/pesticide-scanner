import { NextResponse } from "next/server";
import { getSupabase } from "../../../../lib/supabase";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .limit(5);

  return NextResponse.json({
    success: !error,
    error,
    data,
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  });
}