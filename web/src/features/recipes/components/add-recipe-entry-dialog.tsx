"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { addRecipeEntry } from "@/features/meals/actions";
import type { MealSlot } from "@/app/api/meal-slots/route";
import type { RecipeWithItems } from "@/features/recipes/types";

interface Props {
  recipe: RecipeWithItems;
  date?: string;
  children: ReactNode;
  onConfirm?: () => void;
}

function todayString(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function calcMacros(recipe: RecipeWithItems, servings: number) {
  let kcal = 0,
    protein_g = 0,
    carbs_g = 0,
    fat_g = 0;
  for (const item of recipe.items) {
    let grams = item.quantity;
    if (item.unit === "ml" && item.food.density_g_per_ml != null) {
      grams = item.quantity * item.food.density_g_per_ml;
    } else if (item.unit === "serving") {
      grams = item.quantity * item.food.serving_size_g;
    }
    const f = grams / 100;
    kcal += item.food.kcal * f;
    protein_g += item.food.protein_g * f;
    carbs_g += item.food.carbs_g * f;
    fat_g += item.food.fat_g * f;
  }
  const s = recipe.servings > 0 ? recipe.servings : 1;
  const r = (n: number) => Math.round((n / s) * servings * 10) / 10;
  return {
    kcal: r(kcal),
    protein_g: r(protein_g),
    carbs_g: r(carbs_g),
    fat_g: r(fat_g),
  };
}

export function AddRecipeEntryDialog({
  recipe,
  date = todayString(),
  children,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [slotId, setSlotId] = useState("");
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/meal-slots")
      .then((r) => r.json())
      .then((data) => {
        const loaded = data.slots as MealSlot[];
        setSlots(loaded);
        if (loaded.length > 0 && !slotId) setSlotId(loaded[0]!.id);
      })
      .catch(() => {});
  }, [open, slotId]);

  const qtyNum = Math.max(0, Number(quantity) || 0);

  const preview = useMemo(() => {
    if (qtyNum <= 0) return null;
    return calcMacros(recipe, qtyNum);
  }, [recipe, qtyNum]);

  const slotName = slots.find((s) => s.id === slotId)?.name ?? "";

  async function handleSubmit() {
    if (qtyNum <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    if (!slotId) {
      toast.error("Selecciona un momento del día");
      return;
    }
    if (recipe.items.length === 0) {
      toast.error("La receta no tiene ingredientes");
      return;
    }

    setSubmitting(true);
    try {
      const macros = calcMacros(recipe, qtyNum);
      const result = await addRecipeEntry({
        date,
        meal_slot_id: slotId,
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        servings: qtyNum,
        kcal: macros.kcal,
        protein_g: macros.protein_g,
        carbs_g: macros.carbs_g,
        fat_g: macros.fat_g,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Añadido a ${slotName}`);
      setOpen(false);
      onConfirm?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{recipe.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="re-quantity">
              Porciones ({recipe.serving_name})
            </Label>
            <Input
              id="re-quantity"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="re-slot">Momento del día</Label>
            <Select value={slotId} onValueChange={setSlotId}>
              <SelectTrigger id="re-slot" className="w-full">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {slots.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {preview && (
            <div className="rounded-lg border bg-zinc-50 p-3 dark:bg-zinc-900">
              <p className="mb-1.5 text-xs font-medium text-zinc-500 uppercase">
                {qtyNum} {recipe.serving_name}
                {qtyNum !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-4 text-sm">
                <span className="font-medium">
                  {Math.round(preview.kcal)} kcal
                </span>
                <span className="text-zinc-500">
                  P {Math.round(preview.protein_g)}g
                </span>
                <span className="text-zinc-500">
                  C {Math.round(preview.carbs_g)}g
                </span>
                <span className="text-zinc-500">
                  G {Math.round(preview.fat_g)}g
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            disabled={submitting || qtyNum <= 0 || !slotId}
            onClick={handleSubmit}
          >
            {submitting
              ? "Añadiendo..."
              : slotName
                ? `Añadir a ${slotName}`
                : "Añadir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
