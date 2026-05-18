"use client";

import { useEffect, useReducer, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmPanel } from "@/components/layout/page-chrome";
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
  const [deleteTarget, setDeleteTarget] = useState<Food | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteCustomFood(deleteTarget.id);
    if (!result.ok) {
      toast.error(result.error);
      setDeleting(false);
      return;
    }
    dispatch({ type: "REMOVE", id: deleteTarget.id });
    setDeleteTarget(null);
    setDeleting(false);
    toast.success("Alimento eliminado");
  }, [deleteTarget]);

  if (state.loading) {
    return (
      <div className="px-page flex flex-col gap-3 pt-2">
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
      <div className="px-page flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm text-red-500">{state.error}</p>
        <Button variant="outline" size="sm" onClick={fetchFoods}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (state.foods.length === 0) {
    return (
      <div className="px-page flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <Search className="text-muted-foreground size-8" />
        <p className="text-muted-foreground text-sm">
          No tienes alimentos propios
        </p>
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
    <div className="px-page flex flex-col gap-2 pt-2">
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
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Eliminar"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(food)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {deleteTarget && (
        <ConfirmPanel
          title={`Eliminar «${deleteTarget.name}»`}
          description="Esta acción no afecta a registros pasados en tu diario."
          confirmLabel="Eliminar"
          destructive
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
