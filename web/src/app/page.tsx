import { ToastDemo } from "@/components/toast-demo";
import { FormDemo } from "@/components/form-demo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-start gap-12 bg-white px-16 py-32 dark:bg-black">
        <section>
          <h1 className="text-3xl font-bold tracking-tight">
            shadcn + Toasts + Forms
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Demo components for UI library testing
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Toast Demo</h2>
          <ToastDemo />
        </section>

        <section className="w-full">
          <h2 className="mb-4 text-xl font-semibold">Form Demo</h2>
          <FormDemo />
        </section>
      </main>
    </div>
  );
}
