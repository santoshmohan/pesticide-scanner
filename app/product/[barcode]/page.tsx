import { supabase } from "../../../lib/supabase";
import { calculateScore } from "../../../lib/score";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";

export default async function ProductReviewPage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;

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
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const { data: links } = await supabase
    .from("product_ingredients")
    .select("ingredient_id")
    .eq("product_id", product.id);

  const ingredientIds = links?.map((x) => x.ingredient_id) || [];

  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("*")
    .in("id", ingredientIds);

  const result = calculateScore(ingredients || []);

  const positives =
    ingredients?.filter((i) => i.risk_level === "low") || [];

  const negatives =
    ingredients?.filter(
      (i) => i.risk_level === "medium" || i.risk_level === "high"
    ) || [];

  const recommendations =
    result.score >= 70
      ? [
          "Lower concern based on current demo ingredient data",
          "Still follow product label instructions carefully",
        ]
      : result.score >= 40
      ? [
          "Use cautiously and avoid unnecessary exposure",
          "Compare with lower-risk alternatives if available",
        ]
      : [
          "Consider safer alternatives if possible",
          "Avoid use near children, pets, and water sources unless label permits",
        ];

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-28">
      <div className="max-w-md mx-auto px-5 pt-8">
        <Link href="/" className="inline-block mb-6 text-gray-600">
          ← Back
        </Link>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex gap-4">
            <img
              src={
                product.image_url ||
                "https://placehold.co/120x120?text=Product"
              }
              alt={product.name}
              className="w-28 h-28 rounded-2xl object-cover bg-gray-100"
            />

            <div className="flex-1">
              <h1 className="text-3xl font-bold leading-tight">
                {product.name}
              </h1>
              <p className="text-gray-500 mt-1">{product.brand}</p>

              <div className="mt-4">
                <div className="text-3xl font-bold">{result.score}/100</div>
                <div
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    result.score >= 70
                      ? "bg-green-100 text-green-700"
                      : result.score >= 40
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {result.verdict}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-3xl font-bold mb-3">Positives</h2>
          <div className="bg-white rounded-3xl shadow-sm divide-y">
            {positives.length > 0 ? (
              positives.map((item) => (
                <div key={item.id} className="p-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.concerns}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">
                No major low-risk positives identified in this demo dataset.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-3xl font-bold mb-3">Negatives</h2>
          <div className="bg-white rounded-3xl shadow-sm divide-y">
            {negatives.length > 0 ? (
              negatives.map((item) => (
                <div key={item.id} className="p-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.concerns}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">
                No major negative flags in this demo dataset.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-3xl font-bold mb-3">Recommendations</h2>
          <div className="bg-white rounded-3xl shadow-sm p-4">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Scoring method + Issue reporting */}
        <section className="mt-6 space-y-3">
          <Link
            href="/scoring-method"
            className="w-full bg-white rounded-3xl shadow-sm p-4 flex items-center justify-between text-left block"
          >
            <span className="font-medium">Scoring method</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          </Link>

          <Link
            href={`/report-issue?barcode=${barcode}&name=${encodeURIComponent(
              product.name
            )}`}
            className="w-full bg-white rounded-3xl shadow-sm p-4 flex items-center justify-between text-left block"
          >
            <span className="font-medium">An issue with this product?</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </Link>
        </section>

        {/* Disclaimer */}
        <div className="mt-6 text-xs text-gray-500 text-center px-4">
          This score is for educational/demo purposes only and does not replace
          official label instructions or regulatory guidance.
        </div>
      </div>

      <BottomNav />
    </main>
  );
}