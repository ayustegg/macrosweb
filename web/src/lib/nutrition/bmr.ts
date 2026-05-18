import type { NutritionProfile } from "./types";

export function calculateBmr(profile: NutritionProfile): number {
  const base =
    10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age;

  switch (profile.sex) {
    case "male":
      return base + 5;
    case "female":
      return base - 161;
    case "other":
      return base + (5 + -161) / 2;
  }
}
