import { getSupabase } from "@/lib/supabase";
import { 
  calculateScore, 
  getVerdictColor, 
  getRiskLevelColor,
  getSafetyPercentage 
} from "@/lib/score";
import { saveToHistory, formatScanDate } from "@/lib/history";
import { getProductImageUrl } from "@/lib/product-image";
import type { HistoryItem } from "@/lib/history";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";

export default async function ProductReviewPage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;
  const supabase = getSupabase();

  // Fetch product
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .single();

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium">Product not found</p>
          <Link href="/" className="text-green-600 mt-4 inline-block">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  // Fetch product-ingredient links
  const { data: links } = await supabase
    .from("product_ingredients")
    .select("ingredient_id")
    .eq("product_id", product.id);

  const ingredientIds = links?.map((x) => x.ingredient_id) || [];

  // Fetch ingredients
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name, risk_level, score_penalty, concerns")
    .in("id", ingredientIds);

  // Calculate score with new function
  const result = calculateScore(ingredients || []);

  // Categorize ingredients
  const positives = ingredients?.filter((i) => i.risk_level === "low") || [];
  const negatives = ingredients?.filter(
    (i) => i.risk_level === "medium" || i.risk_level === "high"
  ) || [];

  // Generate recommendations based on verdict
  const recommendations = getRecommendations(result.verdict);

  // Get UI colors
  const verdictColorClass = getVerdictColor(result.verdict);
  const highRiskColor = getRiskLevelColor("high");
  const mediumRiskColor = getRiskLevelColor("medium");
  const lowRiskColor = getRiskLevelColor("low");

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-28">
      <div className="max-w-md mx-auto px-5 pt-8">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-6 text-gray-600 hover:text-gray-900">
          ← Back
        </Link>

        {/* Product Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex gap-4">
            <img
              src={
                getProductImageUrl(product.image_url) ||
                "https://placehold.co/120x120?text=Product"
              }
              alt={product.name}
              className="w-28 h-28 rounded-2xl object-contain bg-gray-100"
            />

            <div className="flex-1">
              <h1 className="text-3xl font-bold leading-tight">
                {product.name}
              </h1>
              <p className="text-gray-500 mt-1">{product.brand}</p>
              {product.category && (
                <p className="text-xs text-gray-400 mt-1">{product.category}</p>
              )}

              <div className="mt-4">
                <div className="text-4xl font-bold">{result.score}/100</div>
                <div
                  className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-semibold border ${verdictColorClass}`}
                >
                  {result.verdict}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            {result.summary}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">
                {result.riskBreakdown.high.length}
              </div>
              <div className="text-xs text-red-600">High Risk</div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-600">
                {result.riskBreakdown.medium.length}
              </div>
              <div className="text-xs text-yellow-600">Medium Risk</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                {result.riskBreakdown.low.length}
              </div>
              <div className="text-xs text-green-600">Low Risk</div>
            </div>
          </div>
        </div>

        {/* High Risk Warnings */}
        {result.warnings.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-bold mb-3 text-red-600">
              ⚠️ Health Concerns
            </h2>
            <div className="bg-white rounded-3xl shadow-sm divide-y">
              {result.warnings.map((warning) => (
                <div
                  key={warning.ingredient}
                  className={`p-4 ${getRiskLevelColor(warning.risk_level)}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-semibold">{warning.ingredient}</p>
                      <p className="text-sm mt-1">{warning.concerns}</p>
                      <p className="text-xs mt-2 opacity-75">
                        Risk Level: {warning.risk_level.toUpperCase()} | Penalty: -{warning.penalty}
                      </p>
                    </div>
                    <div className="text-lg font-bold opacity-50">
                      -{warning.penalty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Positives */}
        {positives.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-bold mb-3 text-green-600">
              ✅ Lower Risk Ingredients
            </h2>
            <div className="bg-white rounded-3xl shadow-sm divide-y">
              {positives.map((item) => (
                <div key={item.id} className={`p-4 ${lowRiskColor}`}>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm mt-1">{item.concerns}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Ingredients */}
        {ingredients && ingredients.length > 0 && (
          <section className="mt-6">
            <h2 className="text-2xl font-bold mb-3">All Ingredients ({ingredients.length})</h2>
            <div className="bg-white rounded-3xl shadow-sm divide-y">
              {ingredients.map((item) => {
                const color = getRiskLevelColor(item.risk_level);
                return (
                  <div key={item.id} className={`p-4 ${color}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {item.risk_level.toUpperCase()} RISK
                        </p>
                      </div>
                      <span className="text-sm font-semibold opacity-75">
                        -{item.score_penalty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section className="mt-6">
          <h2 className="text-2xl font-bold mb-3">💡 Recommendations</h2>
          <div className="bg-white rounded-3xl shadow-sm p-4">
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-gray-700">
                  <span className="text-lg leading-none">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Scoring Method & Report Issue */}
        <section className="mt-6 space-y-3">
          <Link
            href="/scoring-method"
            className="w-full bg-white rounded-3xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="font-medium">📊 How We Score</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <Link
            href={`/report-issue?barcode=${barcode}&name=${encodeURIComponent(
              product.name
            )}`}
            className="w-full bg-white rounded-3xl shadow-sm p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="font-medium">⚠️ Report an Issue</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </section>

        {/* Disclaimer */}
        <div className="mt-8 text-xs text-gray-500 text-center px-4 pb-4">
          <p className="mb-2">
            ⚠️ <strong>Disclaimer:</strong> This score is for educational/demo purposes only and 
            does not replace official label instructions or regulatory guidance.
          </p>
          <p>
            Always follow product label instructions and consult regulatory authorities for 
            official safety information.
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}

/**
 * Generate recommendations based on verdict
 */
function getRecommendations(
  verdict: "Excellent" | "Good" | "Moderate" | "Poor" | "Bad"
): string[] {
  switch (verdict) {
    case "Excellent":
      return [
        "This product appears to be safe based on current ingredient data",
        "Still follow all product label instructions and safety guidelines",
        "Store safely away from children and pets",
      ];

    case "Good":
      return [
        "This product is generally safe with some minor concerns",
        "Follow all label instructions carefully",
        "Store in a safe, secure location",
        "Consider safer alternatives if available",
      ];

    case "Moderate":
      return [
        "Use this product cautiously and avoid unnecessary exposure",
        "Always wear appropriate protective equipment as recommended",
        "Avoid use near children, pets, and water sources unless label permits",
        "Compare with lower-risk alternatives if available",
      ];

    case "Poor":
      return [
        "This product contains multiple concerning ingredients",
        "Use only if absolutely necessary and with extreme caution",
        "Wear full protective equipment as specified on label",
        "Avoid all contact with skin, eyes, and inhalation",
        "Keep away from children, pets, and sensitive areas",
        "Strongly consider safer alternatives",
      ];

    case "Bad":
      return [
        "This product has significant safety concerns",
        "Consider avoiding this product if possible",
        "If use is necessary, consult safety professionals first",
        "Seek safer, lower-risk alternatives",
        "Never use without proper personal protective equipment",
        "Do not use around children, pets, or water sources",
      ];

    default:
      return ["Follow all label instructions carefully"];
  }
}