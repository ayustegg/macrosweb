import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Completa tu perfil
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Paso a paso para calcular tus objetivos
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  );
}
