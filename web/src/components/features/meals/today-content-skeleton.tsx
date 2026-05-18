import { Skeleton } from "@/components/ui/skeleton";

function MealSlotSkeleton() {
  return (
    <section
      className="border-border bg-card shadow-app-1 overflow-hidden rounded-[22px] border"
      style={{ marginBottom: "var(--slot-gap)" }}
    >
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-7 rounded-lg" />
          <Skeleton className="h-[15px] w-24 rounded-md" />
        </div>
        <Skeleton className="h-3.5 w-14 rounded-md" />
      </div>
      <div className="space-y-0">
        <div className="border-border/60 flex items-center gap-3 border-t px-4 py-3">
          <Skeleton className="h-4 flex-1 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
        <div className="border-border/60 flex items-center gap-3 border-t px-4 py-3">
          <Skeleton className="h-4 flex-1 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
      </div>
    </section>
  );
}

/** Skeleton matching DailyMacroSummary (compact) + meal slots on the home tab. */
export function TodayContentSkeleton() {
  return (
    <div
      className="animate-in fade-in space-y-3.5 duration-200"
      aria-busy
      aria-label="Cargando día"
    >
      <section className="border-border bg-card shadow-app-1 overflow-hidden rounded-[22px] border">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-[52px] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-[22px] w-[9.5rem] rounded-md" />
            <Skeleton className="h-3 w-[7rem] rounded-md" />
            <Skeleton className="h-1 w-full rounded-full" />
            <div className="grid grid-cols-4 gap-1">
              <Skeleton className="h-[38px] rounded-md" />
              <Skeleton className="h-[38px] rounded-md" />
              <Skeleton className="h-[38px] rounded-md" />
            </div>
          </div>
          <Skeleton className="size-5 shrink-0 rounded-sm" />
        </div>
      </section>

      <div className="flex items-baseline justify-between px-1 pt-1">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-3 w-[4.5rem] rounded-md" />
      </div>

      <div>
        <MealSlotSkeleton />
        <MealSlotSkeleton />
        <MealSlotSkeleton />
      </div>
    </div>
  );
}
