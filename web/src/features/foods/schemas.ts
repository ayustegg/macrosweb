import { z } from "zod";

export const createFoodSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  source: z.enum(["off", "custom"]),
  barcode: z.string().optional(),
  serving_size_g: z.coerce
    .number()
    .positive("La porción debe ser mayor a 0")
    .default(100),
  serving_name: z.string().optional(),
  density_g_per_ml: z.coerce
    .number()
    .positive("La densidad debe ser mayor a 0")
    .optional(),
  kcal: z.coerce.number().min(0, "Las calorías no pueden ser negativas"),
  protein_g: z.coerce.number().min(0, "La proteína no puede ser negativa"),
  carbs_g: z.coerce
    .number()
    .min(0, "Los carbohidratos no pueden ser negativos"),
  fat_g: z.coerce.number().min(0, "La grasa no puede ser negativa"),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;

export const updateFoodSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").optional(),
  barcode: z.string().optional(),
  serving_size_g: z.coerce
    .number()
    .positive("La porción debe ser mayor a 0")
    .optional(),
  serving_name: z.string().optional(),
  density_g_per_ml: z.coerce
    .number()
    .positive("La densidad debe ser mayor a 0")
    .optional(),
  kcal: z.coerce
    .number()
    .min(0, "Las calorías no pueden ser negativas")
    .optional(),
  protein_g: z.coerce
    .number()
    .min(0, "La proteína no puede ser negativa")
    .optional(),
  carbs_g: z.coerce
    .number()
    .min(0, "Los carbohidratos no pueden ser negativos")
    .optional(),
  fat_g: z.coerce.number().min(0, "La grasa no puede ser negativa").optional(),
});

export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
