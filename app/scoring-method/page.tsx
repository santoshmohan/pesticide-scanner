import Link from "next/link";
import { getVerdictColor, getRiskLevelColor } from "@/lib/score";
import BottomNav from "../components/BottomNav";

type ScoringMethod = {
  riskLevel: "low" | "medium" | "high";
  penalty: string;
  penaltyValue: number;
  description: string;
  examples: string[];
};

type VerdictRange = {
  verdict: "Excellent" | "Good" | "Moderate" | "Poor" | "Bad";
  range: string;
  icon: string;
  shortDesc: string;
  longDesc: string;
};

const SCORING_METHODS: ScoringMethod[] = [
  {
    riskLevel: "high",
    penalty: "-30 to -35 points",
    penaltyValue: 35,
    description:
      "High concern - carcinogens, neurotoxins, high aquatic toxicity",
    examples: ["Glyphosate", "Permethrin", "Malathion"],
  },
  {
    riskLevel: "medium",
    penalty: "-15 to -20 points",
    penaltyValue: 20,
    description: "Moderate concern - moderate aquatic toxicity, irritants",
    examples: ["Boric Acid", "Pyrethrin", "Spinosad"],
  },
  {
    riskLevel: "low",
    penalty: "-5 points",
    penaltyValue: 5,
    description: "Lower concern - minimal documented health risks",
    examples: ["Citric Acid", "Acetic Acid", "Neem Oil"],
  },
];

const VERDICT_RANGES: VerdictRange[] = [
  {
    verdict: "Excellent",
    range: "80-100",
    icon: "✓",
    shortDesc: "Excellent",
    longDesc: "Minimal concerning ingredients. Very safe for typical use.",
  },
  {
    verdict: "Good",
    range: "70-79",
    icon: "✓",
    shortDesc: "Good",
    longDesc: "Lower concern based on available data",
  },
  {
    verdict: "Moderate",
    range: "50-69",
    icon: "!",
    shortDesc: "Moderate",
    longDesc: "Use with caution; consider alternatives",
  },
  {
    verdict: "Poor",
    range: "30-49",
    icon: "!",
    shortDesc: "Poor",
    longDesc: "High concern; use only if necessary with full protection",
  },
  {
    verdict: "Bad",
    range: "0-29",
    icon: "✕",
    shortDesc: "Bad",
    longDesc: "High concern; seek safer alternatives",
  },
];

export default function ScoringMethodPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-28">
      <div className="max-w-md mx-auto px-5 pt-8">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-6 text-gray-600 hover:text-gray-900">
          ← Back
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-bold mb-2">📊 Scoring Method</h1>
        <p className="text-gray-600 mb-6">
          How we calculate product safety scores
        </p>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
          {/* Overview */}
          <div>
            <p className="text-gray-700">
              Our scoring system evaluates pesticide and chemical products based on 
              ingredient risk data from regulatory sources and hazard databases.
            </p>
          </div>

          {/* How it Works */}
          <div>
            <h2 className="font-semibold text-xl mb-3">🎯 How it works</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>All products start with a base score of <strong>100</strong></li>
              <li>Points are deducted based on ingredient risk level</li>
              <li>
                <strong>High-risk</strong> ingredients (carcinogens, neurotoxins):
                <span className="text-red-600 font-semibold"> -30 to -35 points</span>
              </li>
              <li>
                <strong>Medium-risk</strong> ingredients (moderate toxicity):
                <span className="text-yellow-600 font-semibold"> -15 to -20 points</span>
              </li>
              <li>
                <strong>Low-risk</strong> ingredients (minimal concern):
                <span className="text-green-600 font-semibold"> -5 points</span>
              </li>
              <li>Final score is capped at a minimum of <strong>0</strong></li>
            </ul>
          </div>

          {/* Risk Levels Breakdown */}
          <div>
            <h2 className="font-semibold text-xl mb-3">⚠️ Risk Levels</h2>
            <div className="space-y-3">
              {SCORING_METHODS.map((method) => {
                const color = getRiskLevelColor(method.riskLevel);
                return (
                  <div key={method.riskLevel} className={`${color} p-4 rounded-2xl`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold capitalize">
                          {method.riskLevel}-Risk
                        </p>
                        <p className="text-sm opacity-75 font-semibold">
                          Penalty: {method.penalty}
                        </p>
                      </div>
                      <span className="font-bold text-lg opacity-50">
                        -{method.penaltyValue}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{method.description}</p>
                    <div className="text-xs opacity-75">
                      Examples: {method.examples.join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score Ranges */}
          <div>
            <h2 className="font-semibold text-xl mb-3">📈 Score Ranges & Verdicts</h2>
            <div className="space-y-3">
              {VERDICT_RANGES.map((item) => {
                const colorClass = getVerdictColor(item.verdict);
                const bgColor =
                  item.verdict === "Excellent" || item.verdict === "Good"
                    ? "bg-green-500"
                    : item.verdict === "Moderate"
                      ? "bg-yellow-500"
                      : item.verdict === "Poor"
                        ? "bg-orange-500"
                        : "bg-red-500";

                return (
                  <div key={item.verdict} className="flex items-start gap-3">
                    <div
                      className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {item.range}: <span className="capitalize">{item.verdict}</span>
                      </p>
                      <p className="text-sm text-gray-600">{item.longDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculation Example */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h2 className="font-semibold text-lg mb-3">🧮 Example Calculation</h2>
            <div className="space-y-2 font-mono text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Base Score</span>
                <span className="font-bold">100</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <p className="text-gray-600 mb-2">Penalties applied:</p>
                <div className="ml-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Glyphosate (High)</span>
                    <span className="font-bold text-red-600">-35</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pyrethrin (Medium)</span>
                    <span className="font-bold text-yellow-600">-20</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                <span>Final Score</span>
                <span className="text-yellow-600">45</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <p className="text-gray-600">
                  Verdict: <span className="font-bold text-yellow-600">Moderate</span>
                </p>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h2 className="font-semibold text-xl mb-3">📚 Data Sources</h2>
            <p className="text-sm text-gray-700 mb-2">
              This scoring uses hazard classifications based on:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>EPA Pesticide Chemical Search</li>
              <li>EU Pesticides Database</li>
              <li>PAN Pesticide Database</li>
              <li>Academic toxicology literature</li>
              <li>Regulatory guidance documents</li>
            </ul>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="font-semibold text-xl mb-3">✨ Key Features</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <strong>📊 Risk Breakdown:</strong> See how many high, medium, and low risk 
                ingredients are in each product
              </li>
              <li>
                <strong>💾 Scan History:</strong> All scanned products saved for future reference
              </li>
              <li>
                <strong>🔍 Detailed Analysis:</strong> Complete ingredient information and 
                concern descriptions
              </li>
              <li>
                <strong>📱 Mobile Friendly:</strong> Scan and check products on the go
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="border-t pt-4 bg-yellow-50 rounded-xl p-4 -mx-6 px-6">
            <p className="text-xs text-gray-700">
              <strong>⚠️ Important Disclaimer:</strong> This scoring is for educational and 
              demonstration purposes only. It does not replace official product labels, 
              regulatory guidance (EPA, FDA, etc.), or professional advice. Always follow 
              manufacturer instructions and consult relevant authorities for health and 
              safety decisions.
            </p>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 text-xs text-gray-600 pt-4 border-t">
            <p>
              <strong>Updates:</strong> Ingredient data is updated periodically as new 
              research and regulatory information becomes available.
            </p>
            <p>
              <strong>Questions?</strong> This app is educational. For regulatory compliance 
              or official safety information, contact EPA, FDA, or your local health department.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 text-center">
          <Link
            href="/scan"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-3xl font-semibold transition"
          >
            🔍 Start Scanning
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}