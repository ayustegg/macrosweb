import { Skeleton } from "@/components/ui/skeleton";

export default function RecipesLoading() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-24">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      <Skeleton className="h-10 w-full rounded-lg" />

      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl px-3 py-3 ring-1"
          >
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
