"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { RecipeCard } from "./recipe-card";
import type { Recipe } from "@/features/recipes/types";

interface Props {
  recipes: Recipe[];
}

export function RecipeListClient({ recipes }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const filtered = debouncedQuery.trim()
    ? recipes.filter((r) =>
        r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : recipes;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recetas…"
          className="h-10 pr-9 pl-9 text-base"
          autoComplete="off"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-2 -translate-y-1/2"
            onClick={() => setQuery("")}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {query
            ? "No se encontraron recetas con ese nombre."
            : "Aún no tienes recetas."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
