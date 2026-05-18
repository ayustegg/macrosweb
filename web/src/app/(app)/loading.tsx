export default function AppLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="fixed inset-x-0 bottom-0 flex items-center justify-around border-t bg-white pb-[env(safe-area-inset-bottom)] dark:border-zinc-800 dark:bg-black">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1 py-2">
            <div className="h-5 w-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
