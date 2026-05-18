"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Food } from "@/types/food";

export interface IngredientDraft {
  food: Food;
  quantity: number;
  unit: "g" | "ml" | "serving";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (ingredient: IngredientDraft) => void;
}

const UNITS = [
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "serving", label: "ración" },
] as const;

export function IngredientPicker({ open, onClose, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState<"g" | "ml" | "serving">("g");

  function handleSelectFood(food: Food) {
    setSelected(food);
    setQuantity("100");
    setUnit("g");
  }

  function handleAdd() {
    if (!selected || !quantity || Number(quantity) <= 0) return;
    onAdd({ food: selected, quantity: Number(quantity), unit });
    handleClose();
  }

  function handleClose() {
    setQuery("");
    setSelected(null);
    setQuantity("100");
    setUnit("g");
    onClose();
  }

  const availableUnits = UNITS.filter((u) => {
    if (u.value === "ml" && selected && selected.density_g_per_ml == null)
      return false;
    if (u.value === "serving" && selected && !selected.serving_size_g)
      return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle>Añadir ingrediente</DialogTitle>
        </DialogHeader>

        {selected ? (
          <div className="flex flex-col gap-4 px-4 pb-6">
            <div>
              <p className="text-sm font-medium">{selected.name}</p>
              <p className="text-xs text-zinc-500">
                {selected.kcal} kcal / 100g
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="ing-quantity">Cantidad</Label>
                <Input
                  id="ing-quantity"
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-28">
                <Label htmlFor="ing-unit">Unidad</Label>
                <Select
                  value={unit}
                  onValueChange={(v) => setUnit(v as "g" | "ml" | "serving")}
                >
                  <SelectTrigger id="ing-unit" className="mt-1">
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
                variant="outline"
                className="flex-1"
                onClick={() => setSelected(null)}
              >
                Cambiar alimento
              </Button>
              <Button
                className="flex-1"
                onClick={handleAdd}
                disabled={!quantity || Number(quantity) <= 0}
              >
                Añadir a la receta
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="px-4 pb-3">
              <FoodSearchInput value={query} onChange={setQuery} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <FoodSearchResults
                query={debouncedQuery}
                onSelect={handleSelectFood}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
