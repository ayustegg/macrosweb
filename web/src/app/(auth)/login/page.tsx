import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <div className="mt-4 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Registrarse
        </Link>
      </div>
      <div className="mt-2 text-center text-sm">
        <Link
          href="/auth/reset"
          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </>
  );
}
