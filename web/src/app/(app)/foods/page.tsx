"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomFoodsList } from "@/features/foods/components/custom-foods-list";
import { FoodSearchPageTab } from "./food-search-tab";

export default function FoodsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") === "custom" ? "custom" : "search";

  return (
    <Tabs
      value={tab}
      onValueChange={(v) =>
        router.replace(`/foods?tab=${v}`, { scroll: false })
      }
      className="flex flex-1 flex-col"
    >
      <div className="sticky top-0 z-10 border-b bg-white px-4 pt-3 dark:bg-black">
        <TabsList className="w-full">
          <TabsTrigger value="search" className="flex-1">
            Buscar
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex-1">
            Mis alimentos
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="search" className="flex flex-1 flex-col">
        <FoodSearchPageTab />
      </TabsContent>

      <TabsContent value="custom" className="flex flex-1 flex-col pt-3">
        <CustomFoodsList />
      </TabsContent>
    </Tabs>
  );
}
