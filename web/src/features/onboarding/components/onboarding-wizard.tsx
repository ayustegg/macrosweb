"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

import { suggestedMacros } from "@/features/profile/domain";
import { completeOnboarding } from "@/features/profile/actions";
import type { GoalType } from "@/lib/nutrition/types";

type Step = 1 | 2 | 3 | 4 | 5;

const activityCards = [
  {
    value: "sedentary",
    label: "Sedentario",
    description: "Poco o ningún ejercicio. Trabajo de oficina o remoto.",
  },
  {
    value: "light",
    label: "Ligero",
    description: "Ejercicio suave 1–3 días por semana. Caminatas, yoga.",
  },
  {
    value: "moderate",
    label: "Moderado",
    description: "Ejercicio 3–5 días por semana. Correr, natación, gimnasio.",
  },
  {
    value: "active",
    label: "Activo",
    description: "Ejercicio 6–7 días por semana. Entrenamiento intenso.",
  },
  {
    value: "very_active",
    label: "Muy activo",
    description:
      "Ejercicio intenso diario o trabajo físico. Atletas, construcción.",
  },
];

const goalOptions: { value: GoalType; label: string; description: string }[] = [
  {
    value: "lose",
    label: "Perder peso",
    description: "Déficit calórico de 500 kcal",
  },
  {
    value: "maintain",
    label: "Mantener peso",
    description: "Equilibrio calórico",
  },
  {
    value: "gain",
    label: "Ganar masa",
    description: "Superávit calórico de 300 kcal",
  },
];

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

interface FormState {
  displayName: string;
  timezone: string;
  sex: string;
  birthDate: string;
  heightCm: string;
  weightKg: string;
  activityLevel: string;
  goalType: GoalType;
}

function validateStep(step: Step, state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!state.displayName.trim()) errors.displayName = "Introduce tu nombre";
    if (!state.timezone) errors.timezone = "Selecciona tu zona horaria";
  }

  if (step === 2) {
    if (!state.sex) errors.sex = "Selecciona tu sexo";
    if (!state.birthDate)
      errors.birthDate = "Selecciona tu fecha de nacimiento";
  }

  if (step === 3) {
    const h = Number(state.heightCm);
    if (!state.heightCm || isNaN(h) || h < 50 || h > 250)
      errors.heightCm = "La altura debe ser entre 50 y 250 cm";
    const w = Number(state.weightKg);
    if (!state.weightKg || isNaN(w) || w < 20 || w > 500)
      errors.weightKg = "El peso debe ser entre 20 y 500 kg";
  }

  if (step === 4) {
    if (!state.activityLevel)
      errors.activityLevel = "Selecciona tu nivel de actividad";
  }

  return errors;
}

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<FormState>({
    displayName: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sex: "",
    birthDate: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "",
    goalType: "maintain",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function goNext() {
    const errors = validateStep(step, state);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStep((s) => (s + 1) as Step);
  }

  function goBack() {
    setFieldErrors({});
    setStep((s) => (s - 1) as Step);
  }

  async function handleSubmit() {
    const errors = validateStep(step, state);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.set("displayName", state.displayName);
    formData.set("sex", state.sex);
    formData.set("birthDate", state.birthDate);
    formData.set("heightCm", state.heightCm);
    formData.set("weightKg", state.weightKg);
    formData.set("activityLevel", state.activityLevel);
    formData.set("timezone", state.timezone);

    const result = await completeOnboarding(formData);

    if (!result.ok) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      toast.error(result.error);
      setSubmitting(false);
    }
  }

  const age = state.birthDate
    ? new Date().getFullYear() - new Date(state.birthDate).getFullYear()
    : 0;

  const maintainKcal = useMemo(() => {
    if (
      !state.sex ||
      !state.heightCm ||
      !state.weightKg ||
      !state.birthDate ||
      !state.activityLevel
    )
      return null;
    const h = Number(state.heightCm);
    const w = Number(state.weightKg);
    if (isNaN(h) || isNaN(w) || !h || !w) return null;
    return suggestedMacros(
      {
        sex: state.sex as "male" | "female" | "other",
        weight_kg: w,
        height_cm: h,
        age,
        activity_level: state.activityLevel as
          | "sedentary"
          | "light"
          | "moderate"
          | "active"
          | "very_active",
      },
      "maintain"
    ).kcal;
  }, [
    state.sex,
    state.heightCm,
    state.weightKg,
    state.birthDate,
    state.activityLevel,
    age,
  ]);

  const goalPreview = useMemo(() => {
    if (
      !state.sex ||
      !state.heightCm ||
      !state.weightKg ||
      !state.birthDate ||
      !state.activityLevel
    )
      return null;

    const h = Number(state.heightCm);
    const w = Number(state.weightKg);
    if (isNaN(h) || isNaN(w) || !h || !w) return null;

    return suggestedMacros(
      {
        sex: state.sex as "male" | "female" | "other",
        weight_kg: w,
        height_cm: h,
        age,
        activity_level: state.activityLevel as
          | "sedentary"
          | "light"
          | "moderate"
          | "active"
          | "very_active",
      },
      state.goalType
    );
  }, [
    state.sex,
    state.heightCm,
    state.weightKg,
    state.birthDate,
    state.activityLevel,
    state.goalType,
    age,
  ]);

  return (
    <div className="space-y-6">
      <StepsIndicator current={step} total={5} />

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Nombre</Label>
            <Input
              id="displayName"
              placeholder="Tu nombre"
              autoComplete="name"
              value={state.displayName}
              onChange={(e) => updateField("displayName", e.target.value)}
            />
            {fieldErrors.displayName && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.displayName}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="timezone">Zona horaria</Label>
            <Select
              value={state.timezone}
              onValueChange={(v) => updateField("timezone", v)}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Selecciona tu zona" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.timezone && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.timezone}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label>Sexo</Label>
            <RadioGroup
              value={state.sex}
              onValueChange={(v) => updateField("sex", v)}
              className="mt-1.5 flex gap-4"
            >
              {[
                { value: "male", label: "Hombre" },
                { value: "female", label: "Mujer" },
                { value: "other", label: "Otro" },
              ].map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <RadioGroupItem value={o.value} id={`sex-${o.value}`} />
                  <Label htmlFor={`sex-${o.value}`}>{o.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {fieldErrors.sex && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.sex}</p>
            )}
          </div>

          <div>
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              autoComplete="bday"
              value={state.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
              className="mt-1.5"
            />
            {fieldErrors.birthDate && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.birthDate}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="heightCm">Altura (cm)</Label>
            <Input
              id="heightCm"
              type="number"
              placeholder="170"
              inputMode="numeric"
              min={50}
              max={250}
              value={state.heightCm}
              onChange={(e) => updateField("heightCm", e.target.value)}
              className="mt-1.5"
            />
            {fieldErrors.heightCm && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.heightCm}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="weightKg">Peso actual (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              placeholder="70"
              inputMode="decimal"
              min={20}
              max={500}
              value={state.weightKg}
              onChange={(e) => updateField("weightKg", e.target.value)}
              className="mt-1.5"
            />
            {fieldErrors.weightKg && (
              <p className="mt-1 text-sm text-red-500">
                {fieldErrors.weightKg}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2">
          {activityCards.map((card) => (
            <button
              key={card.value}
              type="button"
              onClick={() => updateField("activityLevel", card.value)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                state.activityLevel === card.value
                  ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                  : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
              }`}
            >
              <p className="font-medium">{card.label}</p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {card.description}
              </p>
            </button>
          ))}
          {fieldErrors.activityLevel && (
            <p className="text-sm text-red-500">{fieldErrors.activityLevel}</p>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div>
            <Label>Objetivo</Label>
            <div className="mt-1.5 space-y-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("goalType", opt.value)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    state.goalType === opt.value
                      ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                  }`}
                >
                  <p className="font-medium">{opt.label}</p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {goalPreview && (
            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Meta diaria estimada
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Calorías</span>
                  <span className="font-semibold">{goalPreview.kcal} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Proteína</span>
                  <span className="font-semibold">
                    {goalPreview.protein_g} g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Carbohidratos</span>
                  <span className="font-semibold">{goalPreview.carbs_g} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Grasa</span>
                  <span className="font-semibold">{goalPreview.fat_g} g</span>
                </div>
              </div>
              {maintainKcal != null && maintainKcal !== goalPreview.kcal && (
                <p className="text-xs text-zinc-400">
                  {goalPreview.kcal < maintainKcal
                    ? `${maintainKcal - goalPreview.kcal} kcal menos que tu mantenimiento`
                    : `${goalPreview.kcal - maintainKcal} kcal más que tu mantenimiento`}
                </p>
              )}
              <p className="text-xs text-zinc-400">
                Puedes ajustarlo después desde tu perfil
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="flex-1"
          >
            Atrás
          </Button>
        )}

        {step < 5 ? (
          <Button
            type="button"
            onClick={goNext}
            className={step > 1 ? "flex-1" : "w-full"}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={step > 1 ? "flex-1" : "w-full"}
          >
            {submitting ? "Guardando..." : "Comenzar"}
          </Button>
        )}
      </div>
    </div>
  );
}

function StepsIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              s === current
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                : s < current
                  ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                  : "border border-zinc-300 text-zinc-400 dark:border-zinc-600 dark:text-zinc-500"
            }`}
          >
            {s < current ? "✓" : s}
          </div>
          {s < total && (
            <div
              className={`h-px w-6 ${
                s < current
                  ? "bg-zinc-900 dark:bg-zinc-100"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
