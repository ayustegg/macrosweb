"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRecipe, addRecipeItem } from "@/features/recipes/actions";
import { IngredientPicker, type IngredientDraft } from "./ingredient-picker";
import type { Food } from "@/types/food";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  servings: z.number().int().min(1, "Las porciones deben ser al menos 1"),
  serving_name: z
    .string()
    .min(1, "El nombre de porción es obligatorio")
    .max(100),
  instructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface IngredientRow {
  food: Food;
  quantity: number;
  unit: "g" | "ml" | "serving";
}

interface MacroTotals {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

function calcMacros(
  ingredients: IngredientRow[],
  servings: number
): MacroTotals {
  let kcal = 0,
    protein_g = 0,
    carbs_g = 0,
    fat_g = 0;
  for (const ing of ingredients) {
    let grams = ing.quantity;
    if (ing.unit === "ml" && ing.food.density_g_per_ml != null) {
      grams = ing.quantity * ing.food.density_g_per_ml;
    } else if (ing.unit === "serving") {
      grams = ing.quantity * ing.food.serving_size_g;
    }
    const f = grams / 100;
    kcal += ing.food.kcal * f;
    protein_g += ing.food.protein_g * f;
    carbs_g += ing.food.carbs_g * f;
    fat_g += ing.food.fat_g * f;
  }
  const s = servings > 0 ? servings : 1;
  const r = (n: number) => Math.round((n / s) * 10) / 10;
  return {
    kcal: r(kcal),
    protein_g: r(protein_g),
    carbs_g: r(carbs_g),
    fat_g: r(fat_g),
  };
}

export function RecipeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      servings: 1,
      serving_name: "porción",
      instructions: "",
    },
  });

  const servings = watch("servings") || 1;
  const perServing = calcMacros(ingredients, servings);

  function handleAddIngredient(draft: IngredientDraft) {
    setIngredients((prev) => [...prev, draft]);
  }

  function handleRemoveIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: FormValues) {
    if (ingredients.length === 0) {
      toast.error("Añade al menos un ingrediente a la receta.");
      return;
    }

    startTransition(async () => {
      const result = await createRecipe(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const recipeId = result.data.id;

      for (const ing of ingredients) {
        await addRecipeItem(recipeId, {
          food_id: ing.food.id,
          quantity: ing.quantity,
          unit: ing.unit,
        });
      }

      router.push(`/recipes/${recipeId}`);
    });
  }

  const busy = isSubmitting || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre de la receta</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ej. Pasta boloñesa"
            className="mt-1"
            autoComplete="off"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="servings">Porciones</Label>
            <Input
              id="servings"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              {...register("servings", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.servings && (
              <p className="mt-1 text-xs text-red-500">
                {errors.servings.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="serving_name">Nombre de porción</Label>
            <Input
              id="serving_name"
              {...register("serving_name")}
              placeholder="porción"
              className="mt-1"
            />
            {errors.serving_name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.serving_name.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="instructions">Instrucciones (opcional)</Label>
          <Textarea
            id="instructions"
            {...register("instructions")}
            placeholder="Pasos para preparar la receta…"
            rows={3}
            className="mt-1 resize-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Ingredientes</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Añadir
          </Button>
        </div>

        {ingredients.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">
            Sin ingredientes aún. Pulsa &quot;Añadir&quot; para empezar.
          </p>
        ) : (
          <ul className="space-y-2">
            {ingredients.map((ing, i) => (
              <li
                key={i}
                className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {ing.food.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {ing.quantity} {ing.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(i)}
                  aria-label={`Eliminar ${ing.food.name}`}
                  className="text-zinc-400 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-4 text-sm">
          <p className="mb-2 font-medium">
            Macros por {watch("serving_name") || "porción"}
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(
              [
                { label: "Kcal", value: perServing.kcal },
                { label: "Prot", value: perServing.protein_g },
                { label: "HC", value: perServing.carbs_g },
                { label: "Grasas", value: perServing.fat_g },
              ] as const
            ).map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="font-semibold">{Math.round(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Guardando…" : "Guardar receta"}
      </Button>

      <IngredientPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddIngredient}
      />
    </form>
  );
}
