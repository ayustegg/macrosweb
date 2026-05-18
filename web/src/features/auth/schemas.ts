import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().email("Introduce un email válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(1, "Introduce la contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const resetEmailSchema = z.object({
  email: z.string().email("Introduce un email válido"),
});

export type ResetEmailInput = z.infer<typeof resetEmailSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[a-zA-Z]/, "La contraseña debe contener al menos una letra")
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
