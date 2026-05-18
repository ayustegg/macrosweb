import { describe, expect, it } from "vitest";
import { suggestedGoal } from "./goal";

describe("suggestedGoal", () => {
  /* TDEE = 2500, weight = 80kg */
  const tdee = 2500;
  const weightKg = 80;

  it("suggests lose goal (-500 kcal)", () => {
    const goal = suggestedGoal(tdee, "lose", weightKg);
    /* kcal = 2000
       P = 2 * 80 = 160g -> 640 kcal
       F = 25% of 2000 = 500 kcal / 9 = 55.55... -> 56g
       C = (2000 - 640 - 500) / 4 = 860 / 4 = 215g */
    expect(goal.kcal).toBe(2000);
    expect(goal.protein_g).toBe(160);
    expect(goal.fat_g).toBe(56);
    expect(goal.carbs_g).toBe(215);
  });

  it("suggests maintain goal (0 adjustment)", () => {
    const goal = suggestedGoal(tdee, "maintain", weightKg);
    /* kcal = 2500
       P = 160g -> 640 kcal
       F = 25% of 2500 = 625 / 9 = 69.44... -> 69g
       C = (2500 - 640 - 625) / 4 = 1235 / 4 = 308.75 -> 309g */
    expect(goal.kcal).toBe(2500);
    expect(goal.protein_g).toBe(160);
    expect(goal.fat_g).toBe(69);
    expect(goal.carbs_g).toBe(309);
  });

  it("suggests gain goal (+300 kcal)", () => {
    const goal = suggestedGoal(tdee, "gain", weightKg);
    /* kcal = 2800
       P = 160g -> 640 kcal
       F = 25% of 2800 = 700 / 9 = 77.77... -> 78g
       C = (2800 - 640 - 700) / 4 = 1460 / 4 = 365g */
    expect(goal.kcal).toBe(2800);
    expect(goal.protein_g).toBe(160);
    expect(goal.fat_g).toBe(78);
    expect(goal.carbs_g).toBe(365);
  });

  it("rounds all values to integers", () => {
    const goal = suggestedGoal(1999, "maintain", 65);
    expect(Number.isInteger(goal.kcal)).toBe(true);
    expect(Number.isInteger(goal.protein_g)).toBe(true);
    expect(Number.isInteger(goal.fat_g)).toBe(true);
    expect(Number.isInteger(goal.carbs_g)).toBe(true);
  });
});
