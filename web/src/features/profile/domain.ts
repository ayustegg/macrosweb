import { calculateBmr } from "@/lib/nutrition/bmr";
import { calculateTdee } from "@/lib/nutrition/tdee";
import { suggestedGoal } from "@/lib/nutrition/goal";
import type { GoalType, SuggestedMacros } from "@/lib/nutrition/types";

export interface ProfileInput {
  sex: "male" | "female" | "other";
  weight_kg: number;
  height_cm: number;
  age: number;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export function suggestedMacros(
  profile: ProfileInput,
  goalType: GoalType = "maintain"
): SuggestedMacros {
  const bmr = calculateBmr(profile);
  const tdee = calculateTdee(bmr, profile.activity_level);
  return suggestedGoal(tdee, goalType, profile.weight_kg);
}
