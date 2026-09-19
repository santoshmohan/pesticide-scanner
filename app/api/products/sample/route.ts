import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: products, error } = await supabase
    .from("products")
    .select("barcode")
    .not("barcode", "is", null);

  if (error || !products?.length) {
    return NextResponse.json(
      { message: "No sample barcodes available" },
      { status: 404 }
    );
  }

  const product = products[Math.floor(Math.random() * products.length)];

  return NextResponse.json({ barcode: product.barcode });
}