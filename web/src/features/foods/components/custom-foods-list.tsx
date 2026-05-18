"use client";

import { useEffect, useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCustomFood } from "@/features/foods/actions";
import type { Food } from "@/types/food";

interface State {
  foods: Food[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; foods: Food[] }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "REMOVE"; id: string };

function listReducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { foods: action.foods, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "REMOVE":
      return {
        ...state,
        foods: state.foods.filter((f) => f.id !== action.id),
      };
  }
}

export function CustomFoodsList() {
  const router = useRouter();
  const [state, dispatch] = useReducer(listReducer, {
    foods: [],
    loading: true,
    error: null,
  });

  const fetchFoods = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const res = await fetch("/api/foods/custom");
      if (!res.ok) throw new Error();
      const data = await res.json();
      dispatch({ type: "FETCH_SUCCESS", foods: data.foods });
    } catch {
      dispatch({
        type: "FETCH_ERROR",
        error: "Error al cargar tus alimentos",
      });
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleDelete = useCallback(async (food: Food) => {
    const result = await deleteCustomFood(food.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    dispatch({ type: "REMOVE", id: food.id });
    toast.success("Alimento eliminado");
  }, []);

  if (state.loading) {
    return (
      <div className="flex flex-col gap-3 px-page pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-page py-16 text-center">
        <p className="text-sm text-red-500">{state.error}</p>
        <Button variant="outline" size="sm" onClick={fetchFoods}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (state.foods.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-page py-16 text-center">
        <Search className="h-8 w-8 text-zinc-300" />
        <p className="text-sm text-zinc-500">No tienes alimentos propios</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/foods/new")}
        >
          <Plus className="h-4 w-4" />
          Crear alimento
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-page pt-2">
      {state.foods.map((food) => (
        <Card key={food.id} size="sm">
          <CardContent className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {food.name}
                </span>
                {food.brand && (
                  <span className="truncate text-xs text-zinc-400">
                    {food.brand}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                <span>{food.kcal} kcal</span>
                <span>/ 100g</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => router.push(`/foods/${food.id}/edit`)}
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon-xs" aria-label="Eliminar">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Eliminar alimento</DialogTitle>
                    <DialogDescription>
                      ¿Eliminar &ldquo;{food.name}&rdquo;? Esta acción no afecta
                      a registros pasados.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const closeBtn = document.querySelector(
                          "[data-state='open'] [data-slot='dialog-close']"
                        ) as HTMLButtonElement | null;
                        closeBtn?.click();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(food)}
                    >
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
