"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
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
import { addEntry } from "@/features/meals/actions";
import { computeEntrySnapshot } from "@/features/meals/domain";
import type { Food } from "@/types/food";
import type { MealSlot } from "@/app/api/meal-slots/route";

interface Props {
  food: Food;
  date?: string;
  defaultSlotId?: string;
  onConfirm?: () => void;
  children: ReactNode;
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

export function AddEntryDialog({
  food,
  date = todayString(),
  defaultSlotId,
  onConfirm,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState<"g" | "ml" | "serving">("g");
  const [slotId, setSlotId] = useState(defaultSlotId ?? "");
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/meal-slots")
      .then((r) => r.json())
      .then((data) => {
        const loaded = data.slots as MealSlot[];
        setSlots(loaded);
        if (!defaultSlotId && loaded.length > 0) {
          setSlotId(loaded[0]!.id);
        }
      })
      .catch(() => {});
  }, [defaultSlotId]);

  const availableUnits = useMemo(() => {
    const list: { value: "g" | "ml" | "serving"; label: string }[] = [
      { value: "g", label: "gramos" },
    ];
    if (food.density_g_per_ml) {
      list.push({ value: "ml", label: "mililitros" });
    }
    if (food.serving_size_g > 0) {
      list.push({
        value: "serving",
        label: food.serving_name ?? "porciones",
      });
    }
    return list;
  }, [food]);

  const qtyNum = Number(quantity) || 0;
  const preview = useMemo(() => {
    if (qtyNum <= 0) return null;
    try {
      return computeEntrySnapshot(
        {
          kcal: food.kcal,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fat_g: food.fat_g,
          nutrients: food.nutrients as Record<string, number>,
          serving_size_g: food.serving_size_g,
          density_g_per_ml: food.density_g_per_ml,
        },
        qtyNum,
        unit
      );
    } catch {
      return null;
    }
  }, [food, qtyNum, unit]);

  const slotName = slots.find((s) => s.id === slotId)?.name ?? slotId;

  async function handleSubmit() {
    if (qtyNum <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    if (!slotId) {
      toast.error("Selecciona un momento del día");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("date", date);
      formData.set("meal_slot_id", slotId);
      formData.set("source_type", "food");
      formData.set("source_id", food.id);
      formData.set("quantity", String(qtyNum));
      formData.set("unit", unit);

      const result = await addEntry(formData);
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
          <DialogTitle className="flex items-center gap-2">
            {food.name}
            {food.brand && (
              <span className="text-muted-foreground text-xs font-normal">
                {food.brand}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ae-quantity">Cantidad</Label>
            <Input
              id="ae-quantity"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ae-unit">Unidad</Label>
            <Select
              value={unit}
              onValueChange={(v) => setUnit(v as "g" | "ml" | "serving")}
            >
              <SelectTrigger id="ae-unit" className="w-full">
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

          <div className="space-y-2">
            <Label htmlFor="ae-slot">Momento del día</Label>
            <Select value={slotId} onValueChange={setSlotId}>
              <SelectTrigger id="ae-slot" className="w-full">
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
                {qtyNum}{" "}
                {availableUnits.find((u) => u.value === unit)?.label ?? unit}
              </p>
              <div className="flex gap-4 text-sm">
                <span className="font-medium">{preview.kcal} kcal</span>
                <span className="text-zinc-500">P {preview.protein_g}g</span>
                <span className="text-zinc-500">C {preview.carbs_g}g</span>
                <span className="text-zinc-500">G {preview.fat_g}g</span>
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
