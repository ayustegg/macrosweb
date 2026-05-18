"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Pencil, Trash2, Plus, X, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateRecipe,
  deleteRecipe,
  addRecipeItem,
  removeRecipeItem,
} from "@/features/recipes/actions";
import { FoodSearchInput } from "@/features/foods/components/food-search-input";
import { FoodSearchResults } from "@/features/foods/components/food-search-results";
import { useDebounce } from "@/hooks/use-debounce";
import type { RecipeWithItems } from "@/features/recipes/types";
import type { Food } from "@/types/food";

interface Props {
  recipe: RecipeWithItems;
}

const editSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  servings: z.number().int().min(1, "Las porciones deben ser al menos 1"),
  serving_name: z.string().min(1).max(100),
  instructions: z.string().optional(),
});

type EditValues = z.infer<typeof editSchema>;

const UNITS = [
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "serving", label: "ración" },
] as const;

function calcMacros(items: RecipeWithItems["items"], servings: number) {
  let kcal = 0,
    protein_g = 0,
    carbs_g = 0,
    fat_g = 0;
  for (const item of items) {
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
  const s = servings > 0 ? servings : 1;
  const r = (n: number) => Math.round((n / s) * 10) / 10;
  return {
    kcal: r(kcal),
    protein_g: r(protein_g),
    carbs_g: r(carbs_g),
    fat_g: r(fat_g),
  };
}

export function RecipeDetail({ recipe }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [items, setItems] = useState(recipe.items);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Ingredient picker state
  const [pickerQuery, setPickerQuery] = useState("");
  const debouncedQuery = useDebounce(pickerQuery, 400);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [ingQuantity, setIngQuantity] = useState("100");
  const [ingUnit, setIngUnit] = useState<"g" | "ml" | "serving">("g");

  const macros = calcMacros(items, recipe.servings);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: recipe.name,
      servings: recipe.servings,
      serving_name: recipe.serving_name,
      instructions: recipe.instructions ?? "",
    },
  });

  function onSave(values: EditValues) {
    startTransition(async () => {
      const result = await updateRecipe(recipe.id, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Receta actualizada");
      setEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRecipe(recipe.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Receta eliminada");
      router.push("/recipes");
    });
  }

  function handleSelectFood(food: Food) {
    setSelectedFood(food);
    setIngQuantity("100");
    setIngUnit("g");
  }

  function handleAddIngredient() {
    if (!selectedFood || Number(ingQuantity) <= 0) return;
    startTransition(async () => {
      const result = await addRecipeItem(recipe.id, {
        food_id: selectedFood.id,
        quantity: Number(ingQuantity),
        unit: ingUnit,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setItems((prev) => [...prev, { ...result.data, food: selectedFood }]);
      setSelectedFood(null);
      setPickerQuery("");
      setIngQuantity("100");
      setIngUnit("g");
      setShowIngredientPicker(false);
    });
  }

  function handleRemoveIngredient(itemId: string) {
    startTransition(async () => {
      const result = await removeRecipeItem(itemId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    });
  }

  function closePicker() {
    setShowIngredientPicker(false);
    setSelectedFood(null);
    setPickerQuery("");
    setIngQuantity("100");
    setIngUnit("g");
  }

  const availableUnits = UNITS.filter((u) => {
    if (
      u.value === "ml" &&
      selectedFood &&
      selectedFood.density_g_per_ml == null
    )
      return false;
    if (u.value === "serving" && selectedFood && !selectedFood.serving_size_g)
      return false;
    return true;
  });

  const busy = isSubmitting || isPending;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-xs" asChild>
            <Link href="/recipes" aria-label="Volver a recetas">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="truncate text-xl font-semibold">{recipe.name}</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setEditing((e) => !e)}
            aria-label={editing ? "Cancelar edición" : "Editar receta"}
          >
            {editing ? (
              <X className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Eliminar receta"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Confirmación de borrado inline */}
      {confirmDelete && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="mb-3 text-sm text-red-700 dark:text-red-300">
            ¿Eliminar &ldquo;{recipe.name}&rdquo;? Los registros de comida no se
            verán afectados.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      )}

      {/* Macros por porción */}
      <div className="bg-card ring-foreground/10 rounded-xl p-4 ring-1">
        <p className="mb-3 text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Por {recipe.serving_name} · {recipe.servings}{" "}
          {recipe.servings === 1
            ? recipe.serving_name
            : `${recipe.serving_name}s`}
        </p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {(
            [
              { label: "Kcal", value: macros.kcal },
              { label: "Prot", value: macros.protein_g },
              { label: "HC", value: macros.carbs_g },
              { label: "Grasas", value: macros.fat_g },
            ] as const
          ).map(({ label, value }) => (
            <div key={label} className="space-y-0.5">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="text-base font-semibold">{Math.round(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modo edición */}
      {editing && (
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nombre</Label>
            <Input id="edit-name" {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="edit-servings">Porciones</Label>
              <Input
                id="edit-servings"
                type="number"
                inputMode="numeric"
                min="1"
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
              <Label htmlFor="edit-serving-name">Nombre porción</Label>
              <Input
                id="edit-serving-name"
                {...register("serving_name")}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-instructions">Instrucciones</Label>
            <Textarea
              id="edit-instructions"
              {...register("instructions")}
              rows={3}
              className="mt-1 resize-none"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      )}

      {/* Ingredientes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Ingredientes</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowIngredientPicker((v) => !v)}
            disabled={busy}
          >
            {showIngredientPicker ? (
              <>
                <X className="h-4 w-4" />
                Cerrar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Añadir
              </>
            )}
          </Button>
        </div>

        {/* Ingredient picker inline */}
        {showIngredientPicker && (
          <div className="rounded-xl border bg-zinc-50 dark:bg-zinc-900">
            {selectedFood ? (
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-sm font-medium">{selectedFood.name}</p>
                  <p className="text-xs text-zinc-500">
                    {selectedFood.kcal} kcal / 100g
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
                      value={ingQuantity}
                      onChange={(e) => setIngQuantity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="w-28">
                    <Label htmlFor="ing-unit">Unidad</Label>
                    <Select
                      value={ingUnit}
                      onValueChange={(v) =>
                        setIngUnit(v as "g" | "ml" | "serving")
                      }
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
                    onClick={() => setSelectedFood(null)}
                  >
                    Cambiar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddIngredient}
                    disabled={busy || !ingQuantity || Number(ingQuantity) <= 0}
                  >
                    {busy ? "Añadiendo…" : "Añadir"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="border-b p-3">
                  <FoodSearchInput
                    value={pickerQuery}
                    onChange={setPickerQuery}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {pickerQuery.trim() ? (
                    <FoodSearchResults
                      query={debouncedQuery}
                      onSelect={handleSelectFood}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                      <Search className="h-6 w-6 text-zinc-300" />
                      <p className="text-sm text-zinc-400">Busca un alimento</p>
                    </div>
                  )}
                </div>
                <div className="border-t p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={closePicker}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">
            Sin ingredientes.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.food.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(item.id)}
                  disabled={busy}
                  aria-label={`Eliminar ${item.food.name}`}
                  className="text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {recipe.instructions && !editing && (
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Instrucciones</h2>
          <p className="text-sm whitespace-pre-line text-zinc-600">
            {recipe.instructions}
          </p>
        </div>
      )}

      <Button variant="outline" className="w-full" asChild>
        <Link href={`/recipes/${recipe.id}/add`}>Añadir a un día</Link>
      </Button>
    </div>
  );
}
