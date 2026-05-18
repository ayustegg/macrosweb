import { getCurrentUser } from "@/features/auth/queries";
import { getProfile, getActiveGoal } from "@/features/profile/queries";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const [profile, goal] = await Promise.all([
    getProfile(user.id),
    getActiveGoal(user.id),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tus datos y objetivos
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Información personal</h2>
        <div className="space-y-3 rounded-lg border p-4">
          <Row label="Nombre" value={profile?.display_name ?? "—"} />
          <Row label="Email" value={user.email ?? "—"} />
          <Row
            label="Sexo"
            value={profile?.sex ? labels.sex[profile.sex] : "—"}
          />
          <Row label="Fecha de nacimiento" value={profile?.birth_date ?? "—"} />
          <Row
            label="Altura"
            value={profile?.height_cm ? `${profile.height_cm} cm` : "—"}
          />
          <Row
            label="Actividad"
            value={
              profile?.activity_level
                ? labels.activity[profile.activity_level]
                : "—"
            }
          />
          <Row label="Zona horaria" value={profile?.timezone ?? "UTC"} />
        </div>
      </section>

      {goal && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Objetivo diario</h2>
          <div className="space-y-3 rounded-lg border p-4">
            <Row label="Calorías" value={`${goal.kcal} kcal`} />
            <Row label="Proteína" value={`${goal.protein_g} g`} />
            <Row label="Carbohidratos" value={`${goal.carbs_g} g`} />
            <Row label="Grasa" value={`${goal.fat_g} g`} />
            {goal.is_auto && (
              <p className="text-xs text-zinc-400">Calculado automáticamente</p>
            )}
          </div>
        </section>
      )}

      <Link
        href="/profile/edit"
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
      >
        Editar perfil
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

const labels = {
  sex: {
    male: "Hombre",
    female: "Mujer",
    other: "Otro",
  } as Record<string, string>,
  activity: {
    sedentary: "Sedentario",
    light: "Ligero",
    moderate: "Moderado",
    active: "Activo",
    very_active: "Muy activo",
  } as Record<string, string>,
};
