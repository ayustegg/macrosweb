import { z } from "zod";

export const onboardingSchema = z.object({
  displayName: z.string().min(1, "Introduce tu nombre"),
  sex: z.enum(["male", "female", "other"]),
  birthDate: z.string().min(1, "Selecciona tu fecha de nacimiento"),
  heightCm: z.coerce
    .number()
    .min(50, "La altura debe ser entre 50 y 250 cm")
    .max(250, "La altura debe ser entre 50 y 250 cm"),
  weightKg: z.coerce
    .number()
    .min(20, "El peso debe ser entre 20 y 500 kg")
    .max(500, "El peso debe ser entre 20 y 500 kg"),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  timezone: z.string().min(1, "Selecciona tu zona horaria"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, "Introduce tu nombre").optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  birthDate: z.string().optional(),
  heightCm: z.coerce
    .number()
    .min(50, "La altura debe ser entre 50 y 250 cm")
    .max(250, "La altura debe ser entre 50 y 250 cm")
    .optional(),
  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
