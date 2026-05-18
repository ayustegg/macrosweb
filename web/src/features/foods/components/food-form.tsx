"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { createFoodSchema } from "@/features/foods/schemas";
import { createCustomFood, updateCustomFood } from "@/features/foods/actions";
import type { Food } from "@/types/food";

interface Props {
  food?: Food;
  prefillName?: string;
}

export function FoodForm({ food, prefillName }: Props) {
  const router = useRouter();
  const isEdit = !!food;
  const [microOpen, setMicroOpen] = useState(false);

  const defaultValues = {
    name: food?.name ?? prefillName ?? "",
    source: "custom" as const,
    brand: food?.brand ?? "",
    barcode: food?.barcode ?? "",
    serving_size_g: food?.serving_size_g ?? 100,
    serving_name: food?.serving_name ?? "",
    is_liquid: !!food?.density_g_per_ml,
    density_g_per_ml: food?.density_g_per_ml ?? undefined,
    kcal: food?.kcal ?? 0,
    protein_g: food?.protein_g ?? 0,
    carbs_g: food?.carbs_g ?? 0,
    fat_g: food?.fat_g ?? 0,
    fiber_g: (food?.nutrients?.fiber_g as number) ?? undefined,
    sugars_g: (food?.nutrients?.sugars_g as number) ?? undefined,
    saturated_fat_g: (food?.nutrients?.saturated_fat_g as number) ?? undefined,
    salt_g: (food?.nutrients?.salt_g as number) ?? undefined,
    sodium_mg: (food?.nutrients?.sodium_mg as number) ?? undefined,
  };

  const form = useForm<z.infer<typeof createFoodSchema>>({
    resolver: zodResolver(createFoodSchema) as never,
    defaultValues,
  });

  const kcal = form.watch("kcal");
  const protein_g = form.watch("protein_g");
  const carbs_g = form.watch("carbs_g");
  const fat_g = form.watch("fat_g");
  const isLiquid = form.watch("is_liquid");

  const kcalWarning = useMemo(() => {
    const p = Number(protein_g) || 0;
    const c = Number(carbs_g) || 0;
    const f = Number(fat_g) || 0;
    const calculated = 4 * p + 4 * c + 9 * f;
    const entered = Number(kcal) || 0;
    if (!calculated || !entered) return null;
    const diff = Math.abs(calculated - entered);
    const maxDiff = entered * 0.2;
    if (diff > maxDiff) {
      return {
        message: `Las calorías calculadas (4·${p.toFixed(1)} + 4·${c.toFixed(1)} + 9·${f.toFixed(1)} = ${Math.round(calculated)} kcal) difieren >20% de las ingresadas (${Math.round(entered)} kcal)`,
        calculated: Math.round(calculated),
      };
    }
    return null;
  }, [kcal, protein_g, carbs_g, fat_g]);

  async function onSubmit(values: z.infer<typeof createFoodSchema>) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("source", "custom");
    if (values.brand) formData.set("brand", values.brand);
    if (values.barcode) formData.set("barcode", values.barcode);
    formData.set("serving_size_g", String(values.serving_size_g));
    if (values.serving_name) formData.set("serving_name", values.serving_name);
    const isLiquidVal = values.is_liquid === true || values.is_liquid === "on";
    if (isLiquidVal) {
      formData.set("is_liquid", "on");
    }
    if (values.density_g_per_ml !== undefined) {
      formData.set("density_g_per_ml", String(values.density_g_per_ml));
    }
    formData.set("kcal", String(values.kcal));
    formData.set("protein_g", String(values.protein_g));
    formData.set("carbs_g", String(values.carbs_g));
    formData.set("fat_g", String(values.fat_g));
    if (values.fiber_g !== undefined)
      formData.set("fiber_g", String(values.fiber_g));
    if (values.sugars_g !== undefined)
      formData.set("sugars_g", String(values.sugars_g));
    if (values.saturated_fat_g !== undefined)
      formData.set("saturated_fat_g", String(values.saturated_fat_g));
    if (values.salt_g !== undefined)
      formData.set("salt_g", String(values.salt_g));
    if (values.sodium_mg !== undefined)
      formData.set("sodium_mg", String(values.sodium_mg));

    const result = isEdit
      ? await updateCustomFood(food.id, formData)
      : await createCustomFood(formData);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as Parameters<typeof form.setError>[0], {
            message,
          });
        }
      }
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Alimento actualizado" : "Alimento creado");
    router.push("/foods/search");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            Datos básicos
          </h2>

          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Arroz integral" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de barras</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            Macros por 100g
          </h2>

          <FormField
            name="kcal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calorías (kcal)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="0"
                    {...field}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-3">
            <FormField
              name="protein_g"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proteína (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="carbs_g"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbs (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="fat_g"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grasa (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {kcalWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {kcalWarning.message}
            </div>
          )}
        </section>

        <Separator />

        <section className="space-y-4">
          <button
            type="button"
            className="flex w-full items-center gap-2 text-sm font-semibold tracking-wide text-zinc-500 uppercase"
            onClick={() => setMicroOpen(!microOpen)}
          >
            {microOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Micronutrientes
          </button>

          {microOpen && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  name="fiber_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fibra (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="—"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="sugars_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Azúcares (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="—"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="saturated_fat_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grasa sat. (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="—"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="salt_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sal (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="—"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="sodium_mg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodio (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="any"
                          placeholder="—"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            Porción
          </h2>

          <FormField
            name="serving_size_g"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamaño de porción (g)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="serving_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de porción</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: taza, cucharada, rebanada"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        <section className="space-y-4">
          <FormField
            name="is_liquid"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          form.setValue("density_g_per_ml", undefined);
                        }
                      }}
                    />
                  </FormControl>
                  <Label
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-medium"
                    onClick={() => {
                      const next = !field.value;
                      field.onChange(next);
                      if (!next) {
                        form.setValue("density_g_per_ml", undefined);
                      }
                    }}
                  >
                    <FlaskConical className="h-4 w-4 text-blue-500" />
                    Es líquido
                  </Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {isLiquid && (
            <FormField
              name="density_g_per_ml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Densidad (g/ml)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder="Ej: 1.03"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </section>

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Crear alimento"}
        </Button>
      </form>
    </Form>
  );
}
