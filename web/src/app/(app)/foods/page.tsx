"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomFoodsList } from "@/features/foods/components/custom-foods-list";
import { FoodSearchPageTab } from "./food-search-tab";

const FILTER_CHIPS = ["Personalizados", "Recientes", "Frecuentes", "Open Food Facts"];

export default function FoodsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") === "custom" ? "custom" : "search";

  return (
    <div className="relative flex w-full flex-1 flex-col">
      <div className="flex items-baseline justify-between px-page pt-2 pb-3">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight">
          Alimentos
        </h1>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) =>
          router.replace(`/foods?tab=${v}`, { scroll: false })
        }
        className="flex flex-1 flex-col"
      >
        <div className="sticky top-0 z-10 border-b border-border/80 bg-background/90 px-page pt-1 pb-3 backdrop-blur-md">
          <TabsList className="mb-3 h-10 w-full rounded-xl bg-secondary p-1">
            <TabsTrigger value="search" className="flex-1 rounded-lg text-sm">
              Buscar
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex-1 rounded-lg text-sm">
              Mis alimentos
            </TabsTrigger>
          </TabsList>
          {tab === "search" && (
            <div className="flex flex-wrap gap-1.5">
              {FILTER_CHIPS.map((label, i) => (
                <span
                  key={label}
                  className={`inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold ${
                    i === 0
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="search" className="flex flex-1 flex-col">
          <FoodSearchPageTab />
        </TabsContent>

        <TabsContent value="custom" className="flex flex-1 flex-col pt-3">
          <CustomFoodsList />
        </TabsContent>
      </Tabs>

      {tab === "custom" && (
        <Link
          href="/foods/new"
          className="bottom-fab fixed z-30 flex size-14 items-center justify-center rounded-full bg-foreground text-background shadow-[0_6px_18px_rgba(20,17,13,0.18)]"
          style={{
            right: "max(1.125rem, env(safe-area-inset-right, 0px))",
          }}
          aria-label="Crear alimento"
        >
          <Plus className="size-[26px]" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
