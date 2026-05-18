import { z } from "zod";

export const createRecipeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  servings: z.coerce
    .number()
    .int()
    .min(1, "Las porciones deben ser al menos 1"),
  serving_name: z
    .string()
    .min(1, "El nombre de porción es obligatorio")
    .max(100)
    .default("porción"),
  instructions: z.string().optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;

export const updateRecipeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255).optional(),
  servings: z.coerce
    .number()
    .int()
    .min(1, "Las porciones deben ser al menos 1")
    .optional(),
  serving_name: z
    .string()
    .min(1, "El nombre de porción es obligatorio")
    .max(100)
    .optional(),
  instructions: z.string().optional(),
});

export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;

export const addRecipeItemSchema = z.object({
  food_id: z.string().uuid("ID de alimento inválido"),
  quantity: z.coerce
    .number()
    .positive("La cantidad debe ser mayor a 0")
    .max(5000, "La cantidad no puede superar 5000"),
  unit: z.enum(["g", "ml", "serving"]),
});

export type AddRecipeItemInput = z.infer<typeof addRecipeItemSchema>;
