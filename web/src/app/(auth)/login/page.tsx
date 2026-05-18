import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        ¿No tienes cuenta?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-100"
        >
          Registrarse
        </Link>
      </div>
      <div className="mt-2 text-center text-sm">
        <Link
          href="/auth/reset"
          className="text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </>
  );
}
