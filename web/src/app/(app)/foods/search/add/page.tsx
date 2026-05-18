"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
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

export default function AddFoodEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const foodId = searchParams.get("food");
  const defaultSlotId = searchParams.get("slot") ?? "";
  const date = searchParams.get("date") ?? undefined;

  const [food, setFood] = useState<Food | null>(null);
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [quantity, setQuantity] = useState("100");
  const [unit, setUnit] = useState<"g" | "ml" | "serving">("g");
  const [slotId, setSlotId] = useState(defaultSlotId);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!foodId) return;
    Promise.all([
      fetch(`/api/foods/${foodId}`).then((r) => r.json()),
      fetch("/api/meal-slots").then((r) => r.json()),
    ])
      .then(([foodData, slotsData]) => {
        setFood(foodData as Food);
        const loaded = (slotsData as { slots: MealSlot[] }).slots;
        setSlots(loaded);
        if (!defaultSlotId && loaded.length > 0) {
          setSlotId(loaded[0]!.id);
        }
      })
      .catch(() => toast.error("Error al cargar los datos"))
      .finally(() => setLoading(false));
  }, [foodId, defaultSlotId]);

  const availableUnits = useMemo(() => {
    if (!food) return [{ value: "g" as const, label: "gramos" }];
    const list: { value: "g" | "ml" | "serving"; label: string }[] = [
      { value: "g", label: "gramos" },
    ];
    if (food.density_g_per_ml) list.push({ value: "ml", label: "mililitros" });
    if (food.serving_size_g > 0)
      list.push({ value: "serving", label: food.serving_name ?? "porciones" });
    return list;
  }, [food]);

  const qtyNum = Number(quantity) || 0;

  const preview = useMemo(() => {
    if (!food || qtyNum <= 0) return null;
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

  const slotName = slots.find((s) => s.id === slotId)?.name ?? "";

  async function handleSubmit() {
    if (!food) return;
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
      formData.set("date", date ?? new Date().toISOString().slice(0, 10));
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
      const target = date ? `/today?date=${date}` : "/today";
      router.push(target);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 pt-4 pb-24">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="mx-auto max-w-md px-4 pt-8 text-center">
        <p className="text-sm text-zinc-500">Alimento no encontrado.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-4 pb-24">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => router.back()}
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{food.name}</h1>
          {food.brand && <p className="text-xs text-zinc-500">{food.brand}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="add-quantity">Cantidad</Label>
          <Input
            id="add-quantity"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-unit">Unidad</Label>
          <Select
            value={unit}
            onValueChange={(v) => setUnit(v as "g" | "ml" | "serving")}
          >
            <SelectTrigger id="add-unit" className="w-full">
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
          <Label htmlFor="add-slot">Momento del día</Label>
          <Select value={slotId} onValueChange={setSlotId}>
            <SelectTrigger id="add-slot" className="w-full">
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
    </div>
  );
}
