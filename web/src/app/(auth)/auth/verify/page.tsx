import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold">Email confirmado</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Tu cuenta ha sido verificada correctamente.
      </p>
      <Link
        href="/login"
        className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
      >
        Iniciar sesión
      </Link>
    </div>
  );
}
