import { Skeleton } from "@/components/ui/skeleton";

export default function TodayLoading() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 pt-4 pb-24">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <div className="bg-card rounded-xl border p-4">
        <div className="flex justify-center">
          <Skeleton className="h-28 w-28 rounded-full" />
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-xl border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
