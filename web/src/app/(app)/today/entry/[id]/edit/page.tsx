"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEntry, deleteEntry } from "@/features/meals/actions";
import type { Entry } from "@/types/entry";
import type { MealSlot } from "@/app/api/meal-slots/route";

interface ApiEntryResponse {
  entry: Entry;
  slots: MealSlot[];
}

export default function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  const [entryId, setEntryId] = useState<string | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"g" | "ml" | "serving">("g");
  const [moveSlotId, setMoveSlotId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setEntryId(p.id));
  }, [params]);

  useEffect(() => {
    if (!entryId) return;
    Promise.all([
      fetch(`/api/entries/${entryId}`).then((r) => r.json()),
      fetch("/api/meal-slots").then((r) => r.json()),
    ])
      .then(
        ([entryData, slotsData]: [ApiEntryResponse, { slots: MealSlot[] }]) => {
          const e = entryData.entry ?? entryData;
          setEntry(e as Entry);
          setQuantity(String((e as Entry).quantity));
          setUnit((e as Entry).unit);
          setSlots(slotsData.slots);
        }
      )
      .catch(() => toast.error("Error al cargar la entrada"))
      .finally(() => setLoading(false));
  }, [entryId]);

  const qtyNum = Number(quantity) || 0;

  const hasChanges = useMemo(
    () =>
      entry !== null &&
      qtyNum > 0 &&
      (qtyNum !== entry.quantity || unit !== entry.unit),
    [entry, qtyNum, unit]
  );

  const otherSlots = useMemo(
    () => slots.filter((s) => s.id !== entry?.meal_slot_id),
    [slots, entry]
  );

  const backUrl = date ? `/today?date=${date}` : "/today";

  async function handleSave() {
    if (!entry || qtyNum <= 0) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("quantity", String(qtyNum));
      formData.set("unit", unit);
      const result = await updateEntry(entry.id, formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Entrada actualizada");
      router.push(backUrl);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMove() {
    if (!entry || !moveSlotId) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("meal_slot_id", moveSlotId);
      const result = await updateEntry(entry.id, formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Entrada movida");
      router.push(backUrl);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    setDeleting(true);
    try {
      const result = await deleteEntry(entry.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Entrada eliminada");
      router.push(backUrl);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 pt-4 pb-24">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-md px-4 pt-8 text-center">
        <p className="text-sm text-zinc-500">Entrada no encontrada.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(backUrl)}
        >
          Volver
        </Button>
      </div>
    );
  }

  const unitLabel =
    { g: "gramos", ml: "mililitros", serving: "porciones" }[unit] ?? unit;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-4 pb-24">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => router.push(backUrl)}
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="truncate text-lg font-semibold">{entry.source_name}</h1>
      </div>

      {/* Cantidad */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-quantity">Cantidad</Label>
          <div className="flex gap-2">
            <Input
              id="edit-quantity"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1"
            />
            <Select
              value={unit}
              onValueChange={(v) => setUnit(v as "g" | "ml" | "serving")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">gramos</SelectItem>
                <SelectItem value="ml">mililitros</SelectItem>
                <SelectItem value="serving">porciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {qtyNum > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
            <span className="text-zinc-500">
              {qtyNum} {unitLabel}
            </span>
            <span className="font-medium tabular-nums">
              {Math.round(
                entry.kcal * (qtyNum > 0 ? qtyNum / entry.quantity : 1)
              )}{" "}
              kcal
            </span>
          </div>
        )}

        <Button
          className="w-full"
          disabled={!hasChanges || submitting}
          onClick={handleSave}
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {/* Mover a otro momento */}
      {otherSlots.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
            Mover a
          </h2>
          <div className="flex gap-2">
            <Select value={moveSlotId} onValueChange={setMoveSlotId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar momento..." />
              </SelectTrigger>
              <SelectContent>
                {otherSlots.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              disabled={!moveSlotId || submitting}
              onClick={handleMove}
            >
              Mover
            </Button>
          </div>
        </div>
      )}

      {/* Eliminar */}
      <div className="space-y-3 border-t pt-4">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-500 uppercase">
          Eliminar
        </h2>
        {confirmDelete ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="mb-3 text-sm text-red-700 dark:text-red-300">
              ¿Borrar &ldquo;{entry.source_name}&rdquo;? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Borrar"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar entrada
          </Button>
        )}
      </div>
    </div>
  );
}
