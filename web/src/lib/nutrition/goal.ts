import type { GoalType, SuggestedMacros } from "./types";

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function suggestedGoal(
  tdee: number,
  goalType: GoalType,
  weightKg: number
): SuggestedMacros {
  const kcal = tdee + GOAL_ADJUSTMENTS[goalType];

  const protein_g = Math.round(2 * weightKg);

  const fatCalories = kcal * 0.25;
  const fat_g = Math.round(fatCalories / 9);

  const proteinCalories = protein_g * 4;
  const carbCalories = kcal - proteinCalories - fatCalories;
  const carbs_g = Math.round(carbCalories / 4);

  return { kcal, protein_g, carbs_g, fat_g };
}
