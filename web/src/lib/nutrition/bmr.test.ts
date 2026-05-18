import { describe, expect, it } from "vitest";
import { calculateBmr } from "./bmr";
import type { NutritionProfile } from "./types";

describe("calculateBmr", () => {
  it("calculates BMR for male (80kg, 180cm, 30yo)", () => {
    const profile: NutritionProfile = {
      sex: "male",
      weight_kg: 80,
      height_cm: 180,
      age: 30,
      activity_level: "moderate",
    };
    expect(calculateBmr(profile)).toBe(1780);
  });

  it("calculates BMR for female (60kg, 165cm, 25yo)", () => {
    const profile: NutritionProfile = {
      sex: "female",
      weight_kg: 60,
      height_cm: 165,
      age: 25,
      activity_level: "moderate",
    };
    /* 10 * 60 + 6.25 * 165 - 5 * 25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 */
    expect(calculateBmr(profile)).toBe(1345.25);
  });

  it("averages male and female for other sex", () => {
    const profile: NutritionProfile = {
      sex: "other",
      weight_kg: 70,
      height_cm: 170,
      age: 30,
      activity_level: "moderate",
    };
    /* male: 10*70 + 6.25*170 - 5*30 + 5 = 700 + 1062.5 - 150 + 5 = 1617.5
       female: 10*70 + 6.25*170 - 5*30 - 161 = 700 + 1062.5 - 150 - 161 = 1451.5
       average: (1617.5 + 1451.5) / 2 = 1534.5 */
    expect(calculateBmr(profile)).toBe(1534.5);
  });

  it("handles zero weight", () => {
    const profile: NutritionProfile = {
      sex: "male",
      weight_kg: 0,
      height_cm: 170,
      age: 30,
      activity_level: "sedentary",
    };
    expect(calculateBmr(profile)).toBe(6.25 * 170 - 5 * 30 + 5);
  });
});
