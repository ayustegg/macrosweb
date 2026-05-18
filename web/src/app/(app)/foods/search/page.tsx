"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
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

  const handleSelect = useCallback(
    (food: Food) => {
      const slot = searchParams.get("slot");
      if (slot) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("food_id", food.id);
        router.push(`?${params.toString()}`);
      }
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3 dark:bg-black">
        <FoodSearchInput value={input} onChange={setInput} />
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <FoodSearchResults
          query={debouncedQuery}
          onSelect={handleSelect}
          onCreateClick={(name) =>
            router.push(`/foods/new?name=${encodeURIComponent(name)}`)
          }
        />
      </div>

      <div className="fixed right-4 bottom-20 z-40">
        <Button
          size="icon-lg"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => router.push("/foods/new")}
          aria-label="Crear alimento"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
