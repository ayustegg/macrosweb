"use client";

import { MacroRing } from "@/components/features/macros/macro-ring";

const demos = [
  {
    value: 0,
    target: 2200,
    color: "#f43f5e",
    label: "Calorías",
    unit: "kcal",
    title: "0%",
  },
  {
    value: 1100,
    target: 2200,
    color: "#f43f5e",
    label: "Calorías",
    unit: "kcal",
    title: "50%",
  },
  {
    value: 2200,
    target: 2200,
    color: "#f43f5e",
    label: "Calorías",
    unit: "kcal",
    title: "100%",
  },
  {
    value: 2420,
    target: 2200,
    color: "#f43f5e",
    label: "Calorías",
    unit: "kcal",
    title: "110%",
  },
  {
    value: 3300,
    target: 2200,
    color: "#f43f5e",
    label: "Calorías",
    unit: "kcal",
    title: "150%",
  },
];

const fourMacros = [
  {
    value: 1850,
    target: 2200,
    color: "#f43f5e",
    label: "Calorías",
    unit: "kcal",
  },
  { value: 95, target: 100, color: "#3b82f6", label: "Proteína", unit: "g" },
  {
    value: 220,
    target: 200,
    color: "#f59e0b",
    label: "Carbohidratos",
    unit: "g",
  },
  { value: 72, target: 65, color: "#a855f7", label: "Grasa", unit: "g" },
];

export default function MacroRingDevPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12 px-4 py-12">
      <section>
        <h1 className="mb-2 text-2xl font-bold">MacroRing — Demo</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Anillo SVG animado para macros. Verde ≤ target, ámbar{" "}
          {"target < n ≤ target×1.1"}, rojo {"n > target×1.1"}.
        </p>

        <h2 className="mb-4 text-lg font-semibold">Progreso</h2>
        <div className="flex flex-wrap gap-6">
          {demos.map((d) => (
            <div key={d.title} className="flex flex-col items-center gap-2">
              <MacroRing {...d} />
              <span className="text-muted-foreground text-xs">{d.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">4 macros</h2>
        <div className="flex flex-wrap gap-6">
          {fourMacros.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <MacroRing {...m} />
              <span className="text-muted-foreground text-xs">{m.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
