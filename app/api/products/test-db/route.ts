import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET() {
  const { data, error } = await supabase
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