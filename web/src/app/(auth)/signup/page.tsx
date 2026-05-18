"use client";

import { useState } from "react";
import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Revisa tu email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Te hemos enviado un enlace de confirmación. Haz clic en él para
          activar tu cuenta.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-4"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <SignupForm onSuccess={() => setSubmitted(true)} />
      <div className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Iniciar sesión
        </Link>
      </div>
    </>
  );
}
