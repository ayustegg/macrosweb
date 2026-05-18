"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { SubPage } from "@/components/layout/page-chrome";
import { FoodSearchInput } from "@/features/foods/components/food-search-input";
import { FoodSearchResults } from "@/features/foods/components/food-search-results";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import type { Food } from "@/types/food";

export default function FoodSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const debouncedQuery = useDebounce(input, 300);

  const slot = searchParams.get("slot");
  const date = searchParams.get("date");
  const backHref = date ? `/today?date=${date}` : slot ? "/today" : "/foods";

  const handleSelect = useCallback(
    (food: Food) => {
      if (slot) {
        const params = new URLSearchParams({ food: food.id, slot });
        if (date) params.set("date", date);
        router.push(`/foods/search/add?${params.toString()}`);
      }
    },
    [slot, date, router]
  );

  return (
    <SubPage title="Buscar alimento" backHref={backHref}>
      <div className="flex flex-1 flex-col gap-3">
        <FoodSearchInput value={input} onChange={setInput} />
        <FoodSearchResults
          query={debouncedQuery}
          onSelect={slot ? handleSelect : undefined}
          onCreateClick={(name) =>
            router.push(`/foods/new?name=${encodeURIComponent(name)}`)
          }
        />
      </div>

      <div className="bottom-fab fixed right-4 z-40">
        <Button
          size="icon-lg"
          className="shadow-app-1 size-12 rounded-full"
          onClick={() => router.push("/foods/new")}
          aria-label="Crear alimento"
        >
          <Plus className="size-6" />
        </Button>
      </div>
    </SubPage>
  );
}
