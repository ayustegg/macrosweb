import { z } from "zod";

export const nutrientsSchema = z.object({
  fiber_g: z.number().min(0).optional(),
  sugars_g: z.number().min(0).optional(),
  saturated_fat_g: z.number().min(0).optional(),
  trans_fat_g: z.number().min(0).optional(),
  monounsaturated_fat_g: z.number().min(0).optional(),
  polyunsaturated_fat_g: z.number().min(0).optional(),
  cholesterol_mg: z.number().min(0).optional(),
  sodium_mg: z.number().min(0).optional(),
  salt_g: z.number().min(0).optional(),
  potassium_mg: z.number().min(0).optional(),
  calcium_mg: z.number().min(0).optional(),
  iron_mg: z.number().min(0).optional(),
  vitamin_a_mcg: z.number().min(0).optional(),
  vitamin_c_mg: z.number().min(0).optional(),
});

export type Nutrients = z.infer<typeof nutrientsSchema>;
