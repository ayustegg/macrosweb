"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  onboardingSchema,
  type OnboardingInput,
} from "@/features/profile/schemas";
import { completeOnboarding } from "@/features/profile/actions";

const activityLabels: Record<string, string> = {
  sedentary: "Sedentario",
  light: "Ligero",
  moderate: "Moderado",
  active: "Activo",
  very_active: "Muy activo",
};

const timezones = Intl.supportedValuesOf?.("timeZone") ?? [
  "America/Mexico_City",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Bogota",
  "America/Lima",
  "America/Caracas",
  "America/Panama",
  "America/Havana",
  "America/Santo_Domingo",
  "Europe/Madrid",
  "Atlantic/Canary",
];

export function OnboardingForm() {
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any -- @hookform/resolvers v5 + zod v4 z.coerce type mismatch
    defaultValues: {
      displayName: "",
      sex: undefined,
      birthDate: "",
      heightCm: undefined as unknown as number,
      weightKg: undefined as unknown as number,
      activityLevel: undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  async function onSubmit(values: OnboardingInput) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.set(key, String(value));
    }

    const result = await completeOnboarding(formData);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof OnboardingInput, { message });
        }
      }
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Hombre</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Mujer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Otro</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de nacimiento</FormLabel>
              <FormControl>
                <Input type="date" autoComplete="bday" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="heightCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Altura (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="170"
                    inputMode="numeric"
                    min={50}
                    max={250}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="70"
                    inputMode="decimal"
                    min={20}
                    max={500}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="activityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel de actividad</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu actividad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(activityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona horaria</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu zona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Guardando..." : "Comenzar"}
        </Button>
      </form>
    </Form>
  );
}
