import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { calculateScore } from "../../../../lib/score";

export async function GET(
  request: Request,
  context: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await context.params;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .single();

  if (productError || !product) {
    return NextResponse.json({
      found: false,
      message: "Product not found",
      debug: { productError },
    });
  }

  const { data: links, error: linksError } = await supabase
    .from("product_ingredients")
    .select("ingredient_id")
    .eq("product_id", product.id);

  if (linksError || !links || links.length === 0) {
    return NextResponse.json({
      found: true,
      product,
      ingredients: [],
      result: {
        score: 100,
        verdict: "Good",
        warnings: [],
      },
      debug: { linksError, note: "No linked ingredients found" },
    });
  }

  const ingredientIds = links.map((item) => item.ingredient_id);

  const { data: ingredients, error: ingredientsError } = await supabase
    .from("ingredients")
    .select("*")
    .in("id", ingredientIds);

  if (ingredientsError || !ingredients) {
    return NextResponse.json({
      found: true,
      product,
      ingredients: [],
      result: {
        score: 100,
        verdict: "Good",
        warnings: [],
      },
      debug: { ingredientsError },
    });
  }

  const result = calculateScore(ingredients);

  return NextResponse.json({
    found: true,
    product,
    ingredients,
    result,
  });
}