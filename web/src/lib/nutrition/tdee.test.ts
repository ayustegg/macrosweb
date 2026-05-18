import { describe, expect, it } from "vitest";
import { calculateTdee } from "./tdee";

describe("calculateTdee", () => {
  it("calculates TDEE for sedentary (1780 BMR)", () => {
    expect(calculateTdee(1780, "sedentary")).toBe(2136);
  });

  it("calculates TDEE for light activity (1780 BMR)", () => {
    expect(calculateTdee(1780, "light")).toBe(2448);
  });

  it("calculates TDEE for moderate activity (1780 BMR)", () => {
    expect(calculateTdee(1780, "moderate")).toBe(2759);
  });

  it("calculates TDEE for active (1780 BMR)", () => {
    expect(calculateTdee(1780, "active")).toBe(3071);
  });

  it("calculates TDEE for very_active (1780 BMR)", () => {
    expect(calculateTdee(1780, "very_active")).toBe(3382);
  });

  it("works with zero BMR", () => {
    expect(calculateTdee(0, "sedentary")).toBe(0);
  });
});
