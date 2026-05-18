"use client";

import { useEffect, useReducer } from "react";
import { Plus, Search, CloudOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FoodCard } from "./food-card";
import type { Food } from "@/types/food";

interface SearchApiResponse {
  foods: Food[];
  offAvailable: boolean;
}

interface State {
  results: Food[];
  loading: boolean;
  error: string | null;
  offAvailable: boolean;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; foods: Food[]; offAvailable: boolean }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "RESET" };

function searchReducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null, offAvailable: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        results: action.foods,
        offAvailable: action.offAvailable,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "RESET":
      return { ...initialState };
  }
}

const initialState: State = {
  results: [],
  loading: false,
  error: null,
  offAvailable: true,
};

interface Props {
  query: string;
  onSelect?: (food: Food) => void;
  onCreateClick?: (prefillName: string) => void;
}

export function FoodSearchResults({ query, onSelect, onCreateClick }: Props) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  useEffect(() => {
    if (!query.trim()) return;

    let cancelled = false;
    dispatch({ type: "FETCH_START" });

    fetch(`/api/foods/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: SearchApiResponse) => {
        if (!cancelled) {
          dispatch({
            type: "FETCH_SUCCESS",
            foods: data.foods,
            offAvailable: data.offAvailable,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({ type: "FETCH_ERROR", error: "Error al buscar alimentos" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!query.trim()) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <Search className="h-8 w-8 text-zinc-300" />
        <p className="text-sm text-zinc-400">Escribe para buscar alimentos</p>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <p className="text-sm text-red-500">{state.error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "RESET" })}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (state.results.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        {!state.offAvailable ? (
          <>
            <CloudOff className="h-8 w-8 text-zinc-300" />
            <p className="text-sm text-zinc-500">
              Open Food Facts no está disponible ahora
            </p>
            <p className="text-xs text-zinc-400">
              Solo se muestran alimentos locales
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-500">
              No encontramos &ldquo;{query}&rdquo;
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreateClick?.(query)}
            >
              <Plus className="h-4 w-4" />
              Crear alimento personalizado
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pt-2">
      {state.results.map((food) => (
        <FoodCard key={food.id} food={food} onSelect={onSelect} />
      ))}
    </div>
  );
}
