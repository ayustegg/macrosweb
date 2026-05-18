"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoodSearchInput } from "@/features/foods/components/food-search-input";
import { FoodSearchResults } from "@/features/foods/components/food-search-results";
import { useDebounce } from "@/hooks/use-debounce";
import { pushPendingIngredient } from "@/lib/recipe-draft";
import type { Food } from "@/types/food";

export interface IngredientDraft {
  food: Food;
  quantity: number;
  unit: "g" | "ml" | "serving";
}

const UNITS = [
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "serving", label: "ración" },
] as const;

interface Props {
  returnHref: string;
}

export function IngredientAddForm({ returnHref }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState<"g" | "ml" | "serving">("g");

  const availableUnits = UNITS.filter((u) => {
    if (u.value === "ml" && selected && selected.density_g_per_ml == null)
      return false;
    if (u.value === "serving" && selected && !selected.serving_size_g)
      return false;
    return true;
  });

  function handleAdd() {
    if (!selected || !quantity || Number(quantity) <= 0) return;
    pushPendingIngredient({
      food: selected,
      quantity: Number(quantity),
      unit,
    });
    router.push(returnHref);
  }

  if (selected) {
    return (
      <div className="space-y-5">
        <div className="border-border bg-card shadow-app-1 rounded-[18px] border p-4">
          <p className="text-[15px] font-semibold">{selected.name}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {selected.kcal} kcal / 100g
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="ing-quantity">Cantidad</Label>
            <Input
              id="ing-quantity"
              type="number"
              inputMode="decimal"
              min="0.1"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="w-28 space-y-2">
            <Label htmlFor="ing-unit">Unidad</Label>
            <Select
              value={unit}
              onValueChange={(v) => setUnit(v as "g" | "ml" | "serving")}
            >
              <SelectTrigger id="ing-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setSelected(null)}
          >
            Cambiar alimento
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleAdd}
            disabled={!quantity || Number(quantity) <= 0}
          >
            Añadir a la receta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <FoodSearchInput value={query} onChange={setQuery} />
      <FoodSearchResults
        query={debouncedQuery}
        onSelect={(food) => {
          setSelected(food);
          setQuantity("100");
          setUnit("g");
        }}
        onCreateClick={(name) =>
          router.push(
            `/foods/new?name=${encodeURIComponent(name)}&return=${encodeURIComponent(returnHref)}`
          )
        }
      />
    </div>
  );
}
