import type { ActivityLevel } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTdee(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}
