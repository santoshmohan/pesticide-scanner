export type Ingredient = {
  id?: number;
  name: string;
  risk_level: "low" | "medium" | "high";
  score_penalty: number;
  concerns: string;
};

export type ScoreResult = {
  score: number;
  verdict: "Excellent" | "Good" | "Moderate" | "Poor" | "Bad";
  warnings: Warning[];
  riskBreakdown: RiskBreakdown;
  summary: string;
};

export type Warning = {
  ingredient: string;
  risk_level: "low" | "medium" | "high";
  concerns: string;
  penalty: number;
};

export type RiskBreakdown = {
  high: Ingredient[];
  medium: Ingredient[];
  low: Ingredient[];
  totalPenalty: number;
};

export function calculateScore(ingredients: Ingredient[]): ScoreResult {
  let score = 100;
  const warnings: Warning[] = [];
  const riskBreakdown: RiskBreakdown = {
    high: [],
    medium: [],
    low: [],
    totalPenalty: 0,
  };

  // Process each ingredient
  for (const ingredient of ingredients) {
    score -= ingredient.score_penalty;
    riskBreakdown.totalPenalty += ingredient.score_penalty;

    // Categorize by risk level
    if (ingredient.risk_level === "high") {
      riskBreakdown.high.push(ingredient);
    } else if (ingredient.risk_level === "medium") {
      riskBreakdown.medium.push(ingredient);
    } else {
      riskBreakdown.low.push(ingredient);
    }

    // Add warnings for medium and high risk
    if (ingredient.risk_level === "high" || ingredient.risk_level === "medium") {
      warnings.push({
        ingredient: ingredient.name,
        risk_level: ingredient.risk_level,
        concerns: ingredient.concerns,
        penalty: ingredient.score_penalty,
      });
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine verdict based on score
  let verdict: "Excellent" | "Good" | "Moderate" | "Poor" | "Bad";
  if (score >= 80) {
    verdict = "Excellent";
  } else if (score >= 70) {
    verdict = "Good";
  } else if (score >= 50) {
    verdict = "Moderate";
  } else if (score >= 30) {
    verdict = "Poor";
  } else {
    verdict = "Bad";
  }

  // Generate summary
  const summary = generateSummary(
    score,
    verdict,
    riskBreakdown,
    ingredients.length
  );

  return {
    score,
    verdict,
    warnings,
    riskBreakdown,
    summary,
  };
}

/**
 * Generate a human-readable summary of the product safety
 */
function generateSummary(
  score: number,
  verdict: string,
  riskBreakdown: RiskBreakdown,
  totalIngredients: number
): string {
  const highRiskCount = riskBreakdown.high.length;
  const mediumRiskCount = riskBreakdown.medium.length;

  let summary = `This product contains ${totalIngredients} ingredient(s). `;

  if (highRiskCount > 0) {
    summary += `⚠️ ${highRiskCount} high-risk ingredient(s) detected. `;
  }

  if (mediumRiskCount > 0) {
    summary += `⚠️ ${mediumRiskCount} medium-risk ingredient(s) detected. `;
  }

  switch (verdict) {
    case "Excellent":
      summary += "✅ This product appears to be safe with minimal concerning ingredients.";
      break;
    case "Good":
      summary += "✅ This product is generally safe, though some ingredients warrant attention.";
      break;
    case "Moderate":
      summary += "⚠️ This product contains several concerning ingredients. Consider alternatives.";
      break;
    case "Poor":
      summary += "⚠️ This product contains multiple high-risk ingredients. Use with caution.";
      break;
    case "Bad":
      summary += "❌ This product has significant safety concerns. Avoid or use only if necessary.";
      break;
  }

  return summary;
}

/**
 * Get verdict color for UI (Tailwind classes)
 */
export function getVerdictColor(
  verdict: "Excellent" | "Good" | "Moderate" | "Poor" | "Bad"
): string {
  switch (verdict) {
    case "Excellent":
      return "text-green-600 bg-green-50 border-green-200";
    case "Good":
      return "text-green-500 bg-green-50 border-green-200";
    case "Moderate":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "Poor":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "Bad":
      return "text-red-600 bg-red-50 border-red-200";
  }
}

/**
 * Get risk level color for UI (Tailwind classes)
 */
export function getRiskLevelColor(
  riskLevel: "low" | "medium" | "high"
): string {
  switch (riskLevel) {
    case "low":
      return "text-green-600 bg-green-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "high":
      return "text-red-600 bg-red-50";
  }
}

/**
 * Calculate safety score percentage (0-100)
 */
export function getSafetyPercentage(score: number): number {
  return Math.min(100, Math.max(0, score));
}