import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseService } from "@/lib/supabase-service";
import { 
  calculateScore, 
  getVerdictColor, 
  getRiskLevelColor,
  getSafetyPercentage 
} from "@/lib/score";
import type { ScoreResult } from "@/lib/score";

export async function GET(
  request: Request,
  context: { params: Promise<{ barcode: string }> }
) {
  try {
    const supabase = getSupabase();
    const { barcode } = await context.params;
    const normalizedBarcode = barcode.replace(/\D/g, "");

    // Generate barcode candidates (different formats)
    const barcodeCandidates = Array.from(
      new Set([
        normalizedBarcode,
        normalizedBarcode.length === 12
          ? `0${normalizedBarcode}`
          : normalizedBarcode,
        normalizedBarcode.length === 13
          ? normalizedBarcode.slice(1)
          : normalizedBarcode,
      ])
    );

    // Fetch product (read-only via anon key with RLS)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .in("barcode", barcodeCandidates)
      .limit(1)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json(
        {
          found: false,
          message: `Product not found for barcode ${normalizedBarcode || barcode}`,
          debug: { productError, barcodeCandidates },
        },
        { status: 404 }
      );
    }

    // Fetch product-ingredient links
    const { data: links, error: linksError } = await supabase
      .from("product_ingredients")
      .select("ingredient_id")
      .eq("product_id", product.id);

    // Handle no ingredients case
    if (linksError || !links || links.length === 0) {
      const emptyResult: ScoreResult = {
        score: 100,
        verdict: "Excellent",
        warnings: [],
        riskBreakdown: {
          high: [],
          medium: [],
          low: [],
          totalPenalty: 0,
        },
        summary: "No ingredients found in database.",
      };

      return NextResponse.json({
        found: true,
        product,
        ingredients: [],
        result: emptyResult,
        stats: {
          totalIngredients: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
        },
      });
    }

    // Fetch ingredients
    const ingredientIds = links.map((item) => item.ingredient_id);

    const { data: ingredients, error: ingredientsError } = await supabase
      .from("ingredients")
      .select("id, name, risk_level, score_penalty, concerns")
      .in("id", ingredientIds);

    if (ingredientsError || !ingredients || ingredients.length === 0) {
      const emptyResult: ScoreResult = {
        score: 100,
        verdict: "Excellent",
        warnings: [],
        riskBreakdown: {
          high: [],
          medium: [],
          low: [],
          totalPenalty: 0,
        },
        summary: "No ingredients found in database.",
      };

      return NextResponse.json({
        found: true,
        product,
        ingredients: [],
        result: emptyResult,
        stats: {
          totalIngredients: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
        },
      });
    }

    // Calculate score with new function
    const result = calculateScore(ingredients);

    // Count risk levels
    const highRiskCount = result.riskBreakdown.high.length;
    const mediumRiskCount = result.riskBreakdown.medium.length;
    const lowRiskCount = result.riskBreakdown.low.length;

    // Return complete response with UI helpers
    return NextResponse.json(
      {
        found: true,
        product,
        ingredients,
        result,
        stats: {
          totalIngredients: ingredients.length,
          highRiskCount,
          mediumRiskCount,
          lowRiskCount,
          totalPenalty: result.riskBreakdown.totalPenalty,
          safetyPercentage: getSafetyPercentage(result.score),
        },
        ui: {
          verdictColor: getVerdictColor(result.verdict),
          riskLevelColors: {
            high: getRiskLevelColor("high"),
            medium: getRiskLevelColor("medium"),
            low: getRiskLevelColor("low"),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product:", error);

    return NextResponse.json(
      {
        found: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, product_name, issue_type, description, email } = body;

    // Validate required fields
    if (!barcode || !issue_type || !description) {
      return NextResponse.json(
        {
          error: "Missing required fields: barcode, issue_type, description",
        },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Insert using service role (server-side only, bypasses RLS)
    const { data, error } = await getSupabaseService()
      .from("issues")
      .insert({
        barcode,
        product_name,
        issue_type,
        description,
        email,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting issue:", error);
      return NextResponse.json(
        { error: "Failed to report issue" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Issue reported successfully",
        id: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling POST request:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}