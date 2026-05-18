import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MacroRing } from "./macro-ring";

describe("MacroRing", () => {
  it("renders SVG with aria-label", () => {
    const { container } = render(
      <MacroRing
        value={450}
        target={2200}
        color="#f43f5e"
        label="Calorías"
        unit="kcal"
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("role")).toBe("img");
    expect(svg!.getAttribute("aria-label")).toBe("450 de 2200 kcal, Calorías");
  });

  it("renders within target (green) for value <= target", () => {
    const { container } = render(
      <MacroRing
        value={1800}
        target={2200}
        color="#f43f5e"
        label=""
        unit="kcal"
      />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles[1].getAttribute("stroke")).toBe("#22c55e");
  });

  it("renders amber for value between target and target*1.1", () => {
    const { container } = render(
      <MacroRing
        value={2300}
        target={2200}
        color="#f43f5e"
        label=""
        unit="kcal"
      />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles[1].getAttribute("stroke")).toBe("#f59e0b");
  });

  it("renders red for value > target*1.1", () => {
    const { container } = render(
      <MacroRing
        value={2500}
        target={2200}
        color="#f43f5e"
        label=""
        unit="kcal"
      />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles[1].getAttribute("stroke")).toBe("#ef4444");
  });

  it("renders green when target is 0 (edge case)", () => {
    const { container } = render(
      <MacroRing value={0} target={0} color="#f43f5e" label="" unit="kcal" />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles[1].getAttribute("stroke")).toBe("#22c55e");
  });

  it("renders text with value and target", () => {
    const { container } = render(
      <MacroRing value={150} target={200} color="#f43f5e" label="" unit="g" />
    );
    const texts = container.querySelectorAll("text");
    const textContent = Array.from(texts)
      .map((t) => t.textContent)
      .join(" ");
    expect(textContent).toContain("150");
    expect(textContent).toContain("/ 200 g");
  });

  it("applies custom size", () => {
    const { container } = render(
      <MacroRing
        value={100}
        target={200}
        color="#f43f5e"
        label=""
        unit="g"
        size={200}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg!.getAttribute("width")).toBe("200");
    expect(svg!.getAttribute("height")).toBe("200");
  });

  it("matches snapshot at 50%", () => {
    const { container } = render(
      <MacroRing
        value={1100}
        target={2200}
        color="#f43f5e"
        label="Calorías"
        unit="kcal"
      />
    );
    expect(container.innerHTML).toMatchSnapshot();
  });
});
