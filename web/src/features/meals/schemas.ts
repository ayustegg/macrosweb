import { z } from "zod";

export const createEntrySchema = z.object({
  day_log_id: z.string().uuid("ID de día inválido"),
  meal_slot_id: z.string().uuid().optional(),
  source_type: z.enum(["food", "recipe"]),
  source_id: z.string().uuid().optional(),
  source_name: z.string().min(1, "El nombre es obligatorio"),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  unit: z.enum(["g", "ml", "serving"]),
  kcal: z.coerce.number().min(0, "Las calorías no pueden ser negativas"),
  protein_g: z.coerce.number().min(0, "La proteína no puede ser negativa"),
  carbs_g: z.coerce
    .number()
    .min(0, "Los carbohidratos no pueden ser negativos"),
  fat_g: z.coerce.number().min(0, "La grasa no puede ser negativa"),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export const updateEntrySchema = z.object({
  meal_slot_id: z.string().uuid().optional(),
  quantity: z.coerce
    .number()
    .positive("La cantidad debe ser mayor a 0")
    .optional(),
  unit: z.enum(["g", "ml", "serving"]).optional(),
});

export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export const addEntryActionSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  meal_slot_id: z.string().optional(),
  source_type: z.enum(["food", "recipe"]),
  source_id: z.string().uuid("ID de origen inválido"),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  unit: z.enum(["g", "ml", "serving"]),
});

export type AddEntryActionInput = z.infer<typeof addEntryActionSchema>;
