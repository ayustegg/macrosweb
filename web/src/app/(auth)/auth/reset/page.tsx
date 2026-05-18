import { ResetForm } from "@/features/auth/components/reset-form";

export default function ResetPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Nueva contraseña</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Introduce tu nueva contraseña
        </p>
      </div>
      <ResetForm />
    </>
  );
}
