export type Ingredient = {
  name: string;
  risk_level: "low" | "medium" | "high";
  score_penalty: number;
  concerns: string;
};

export function calculateScore(ingredients: Ingredient[]) {
  let score = 100;
  const warnings: { ingredient: string; concerns: string }[] = [];

  for (const ingredient of ingredients) {
    score -= ingredient.score_penalty;

    if (ingredient.risk_level === "high" || ingredient.risk_level === "medium") {
      warnings.push({
        ingredient: ingredient.name,
        concerns: ingredient.concerns,
      });
    }
  }

  score = Math.max(0, score);

  let verdict = "Good";
  if (score < 40) verdict = "Bad";
  else if (score < 70) verdict = "Moderate";

  return {
    score,
    verdict,
    warnings,
  };
}