import { describe, expect, it } from "vitest";
import { suggestedMacros } from "./domain";

const baseProfile = {
  sex: "male" as const,
  weight_kg: 80,
  height_cm: 180,
  age: 30,
  activity_level: "moderate" as const,
};

describe("suggestedMacros", () => {
  it("calculates maintain macros from a profile", () => {
    const result = suggestedMacros(baseProfile, "maintain");

    expect(result.kcal).toBeGreaterThan(2000);
    expect(result.kcal).toBeLessThan(3500);
    expect(result.protein_g).toBe(160);
    expect(result.fat_g).toBeGreaterThan(60);
    expect(result.fat_g).toBeLessThan(100);
    expect(result.carbs_g).toBeGreaterThan(200);
  });

  it("produces lower kcal for lose goal", () => {
    const maintain = suggestedMacros(baseProfile, "maintain");
    const lose = suggestedMacros(baseProfile, "lose");

    expect(lose.kcal).toBe(maintain.kcal - 500);
  });

  it("produces higher kcal for gain goal", () => {
    const maintain = suggestedMacros(baseProfile, "maintain");
    const gain = suggestedMacros(baseProfile, "gain");

    expect(gain.kcal).toBe(maintain.kcal + 300);
  });

  it("uses Mifflin-St Jeor BMR via calculateBmr", () => {
    const result = suggestedMacros(baseProfile, "maintain");

    const bmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    const tdee = Math.round(bmr * 1.55);
    expect(result.kcal).toBe(tdee);
  });

  it("calculates for female profile", () => {
    const femaleProfile = { ...baseProfile, sex: "female" as const };
    const result = suggestedMacros(femaleProfile, "maintain");

    const bmr = 10 * 80 + 6.25 * 180 - 5 * 30 - 161;
    const tdee = Math.round(bmr * 1.55);
    const protein_g = Math.round(2 * 80);
    const fatCalories = tdee * 0.25;
    const fat_g = Math.round(fatCalories / 9);
    const proteinCalories = protein_g * 4;
    const carbCalories = tdee - proteinCalories - fatCalories;
    const carbs_g = Math.round(carbCalories / 4);

    expect(result.kcal).toBe(tdee);
    expect(result.protein_g).toBe(protein_g);
    expect(result.fat_g).toBe(fat_g);
    expect(result.carbs_g).toBe(carbs_g);
  });

  it("calculates for sedentary activity", () => {
    const sedentary = { ...baseProfile, activity_level: "sedentary" as const };
    const result = suggestedMacros(sedentary, "maintain");

    const bmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    expect(result.kcal).toBe(Math.round(bmr * 1.2));
  });

  it("calculates for very_active activity", () => {
    const veryActive = {
      ...baseProfile,
      activity_level: "very_active" as const,
    };
    const result = suggestedMacros(veryActive, "maintain");

    const bmr = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    expect(result.kcal).toBe(Math.round(bmr * 1.9));
  });

  it("defaults to maintain goal", () => {
    const explicit = suggestedMacros(baseProfile, "maintain");
    const implicit = suggestedMacros(baseProfile);

    expect(implicit.kcal).toBe(explicit.kcal);
    expect(implicit.protein_g).toBe(explicit.protein_g);
    expect(implicit.carbs_g).toBe(explicit.carbs_g);
    expect(implicit.fat_g).toBe(explicit.fat_g);
  });
});
