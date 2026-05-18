import { getCurrentUser } from "@/features/auth/queries";
import { getProfile, getActiveGoal } from "@/features/profile/queries";
import { getMealSlots } from "@/features/meals/queries";
import { MealSlotList } from "@/features/meals/components/meal-slot-list";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/app-config";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const [profile, goal, slots] = await Promise.all([
    getProfile(user.id),
    getActiveGoal(user.id),
    getMealSlots(),
  ]);

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Usuario";
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full pb-3">
      <div className="flex items-baseline justify-between px-page pt-2 pb-1">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">
          Perfil
        </h1>
        <Link
          href="/profile/edit"
          className="text-[13px] font-semibold text-accent-foreground hover:text-foreground"
        >
          Editar
        </Link>
      </div>

      <div className="flex flex-col items-center px-page pt-4 pb-6">
        <div className="flex size-[84px] items-center justify-center rounded-full border border-border bg-card text-[28px] font-bold tracking-tight text-accent-foreground shadow-app-1">
          {initials}
        </div>
        <p className="mt-3 text-lg font-bold">{displayName}</p>
        <p className="mt-1 text-[12.5px] font-medium text-muted-foreground">
          {user.email}
        </p>
      </div>

      <ProfileSection title="Información personal">
        <ProfileRow label="Sexo" value={profile?.sex ? labels.sex[profile.sex] : "—"} />
        <ProfileRow label="Fecha de nacimiento" value={profile?.birth_date ?? "—"} />
        <ProfileRow
          label="Altura"
          value={profile?.height_cm ? `${profile.height_cm} cm` : "—"}
        />
        <ProfileRow
          label="Actividad"
          value={
            profile?.activity_level
              ? labels.activity[profile.activity_level]
              : "—"
          }
        />
        <ProfileRow label="Zona horaria" value={profile?.timezone ?? "UTC"} last />
      </ProfileSection>

      <ProfileSection title="Objetivo diario">
        {goal ? (
          <div className="px-4 py-3.5">
            <div className="mb-3 flex items-center justify-between">
              {goal.is_auto && (
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-secondary px-2 text-[11px] font-semibold text-accent-foreground">
                  <Sparkles className="size-2.5" />
                  Calculado automáticamente
                </span>
              )}
              <Link
                href="/profile/edit"
                className="ml-auto text-[12.5px] font-semibold text-accent-foreground hover:text-foreground"
              >
                Personalizar
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <GoalCell label="Kcal" value={goal.kcal} unit="kcal" color="var(--macro-kcal)" />
              <GoalCell label="P" value={goal.protein_g} unit="g" color="var(--macro-pro)" />
              <GoalCell label="C" value={goal.carbs_g} unit="g" color="var(--macro-car)" />
              <GoalCell label="G" value={goal.fat_g} unit="g" color="var(--macro-fat)" />
            </div>
          </div>
        ) : (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            Sin objetivo definido.{" "}
            <Link href="/profile/edit" className="font-semibold text-foreground underline">
              Configurar
            </Link>
          </p>
        )}
      </ProfileSection>

      <ProfileSection title="Mis comidas" subtitle="Arrastra para reordenar">
        <MealSlotList initialSlots={slots} />
      </ProfileSection>

      <p className="px-page pt-5 text-center text-[11px] leading-relaxed text-[var(--muted-2)]">
        {APP_NAME} · hecho con cuidado
      </p>
    </div>
  );
}

function ProfileSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3.5 px-page">
      <div className="mb-1.5 flex items-baseline justify-between px-1">
        <span className="section-label">{title}</span>
        {subtitle && (
          <span className="text-[11px] font-medium text-[var(--muted-2)]">
            {subtitle}
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-[22px] border border-border bg-card shadow-app-1">
        {children}
      </div>
    </section>
  );
}

function ProfileRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${
        last ? "" : "border-b border-border/80"
      }`}
    >
      <span className="text-[14.5px] font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

function GoalCell({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-[10px] bg-secondary px-1.5 py-2.5 text-center">
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className="num mt-1.5 text-[17px] leading-none font-bold"
        style={{ color }}
      >
        {value.toLocaleString("es-ES")}
      </p>
      <p className="mt-0.5 text-[9.5px] text-muted-foreground">{unit}</p>
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
