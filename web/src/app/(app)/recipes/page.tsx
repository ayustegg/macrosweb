export default function RecipesPage() {
  return (
    <div className="w-full px-page pt-2 pb-3">
      <h1 className="pb-3.5 text-[28px] leading-tight font-bold tracking-tight">
        Recetas
      </h1>

      <div className="flex flex-col items-center justify-center px-4 pt-12 pb-16 text-center">
        <div className="mb-5 grid size-32 place-items-center rounded-full bg-secondary">
          <svg
            viewBox="0 0 64 64"
            className="size-16 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M20 16 L20 48 M44 16 L44 48" />
            <path d="M16 48 L48 48" />
            <path d="M28 16 L36 16" />
            <path d="M32 16 L32 8" />
            <path d="M28 24 L36 24 M28 30 L36 30 M28 36 L36 36" />
          </svg>
        </div>
        <h2 className="mb-1 text-lg font-semibold">Próximamente</h2>
        <p className="text-muted-foreground max-w-64 text-sm leading-relaxed">
          Crea y guarda tus combinaciones favoritas de alimentos.
        </p>
      </div>
    </div>
  );
}
