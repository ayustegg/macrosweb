import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Root tab screen: title row + content, consistent across Hoy / Alimentos / Recetas / Perfil */
export function TabPage({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-page w-full pt-2 pb-4", className)}>
      <div className="flex items-baseline justify-between gap-3 pb-3.5">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">
          {title}
        </h1>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Stack screen with back navigation (forms, search, edit flows) */
export function SubPage({
  title,
  backHref,
  subtitle,
  children,
  className,
}: {
  title: string;
  backHref: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-page w-full pt-2 pb-4", className)}>
      <div className="flex items-start gap-2 pb-5">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 size-10 shrink-0 rounded-full"
          asChild
        >
          <Link href={backHref} aria-label="Volver">
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[28px] leading-tight font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 truncate text-sm font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="section-label text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-page flex flex-col items-center justify-center pt-12 pb-16 text-center">
      <div className="bg-secondary mb-5 grid size-32 place-items-center rounded-full">
        {icon}
      </div>
      <h2 className="mb-1 text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-72 text-sm leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}

/** Inline destructive confirmation — no modal overlay */
export function ConfirmPanel({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border p-4",
        destructive
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card shadow-app-1"
      )}
    >
      <h3 className="mb-1 text-[15px] font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {description}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={destructive ? "destructive" : "default"}
          className="flex-1"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Procesando…" : confirmLabel}
        </Button>
      </div>
    </div>
  );
}
