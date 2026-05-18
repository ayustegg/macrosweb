"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SubPage } from "@/components/layout/page-chrome";
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
import type { MealSlot } from "@/features/meals/types";

interface Props {
  entry: Entry;
  mealSlots: MealSlot[];
  date?: string;
}

export function EditEntryClient({
  entry: initialEntry,
  mealSlots,
  date,
}: Props) {
  const router = useRouter();
  const [entry] = useState(initialEntry);
  const [quantity, setQuantity] = useState(String(initialEntry.quantity));
  const [unit, setUnit] = useState<"g" | "ml" | "serving">(initialEntry.unit);
  const [moveSlotId, setMoveSlotId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const qtyNum = Number(quantity) || 0;

  const hasChanges = useMemo(
    () => qtyNum > 0 && (qtyNum !== entry.quantity || unit !== entry.unit),
    [entry, qtyNum, unit]
  );

  const otherSlots = useMemo(
    () => mealSlots.filter((s) => s.id !== entry.meal_slot_id),
    [mealSlots, entry.meal_slot_id]
  );

  const backUrl = date ? `/?date=${date}` : "/";

  async function handleSave() {
    if (qtyNum <= 0) return;
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
    if (!moveSlotId) return;
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

  const unitLabel =
    { g: "gramos", ml: "mililitros", serving: "porciones" }[unit] ?? unit;

  return (
    <SubPage title={entry.source_name} backHref={backUrl}>
      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="section-label text-muted-foreground">Cantidad</h2>
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
            <div className="bg-muted/30 border-border flex items-center justify-between rounded-[14px] border px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">
                {qtyNum} {unitLabel}
              </span>
              <span className="num font-semibold">
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
        </section>

        {otherSlots.length > 0 && (
          <section className="border-border space-y-3 border-t pt-6">
            <h2 className="section-label text-muted-foreground">Mover a</h2>
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
          </section>
        )}

        <section className="border-border space-y-3 border-t pt-6">
          <h2 className="section-label text-muted-foreground">Eliminar</h2>
          {confirmDelete ? (
            <div className="border-destructive/30 bg-destructive/5 rounded-[18px] border p-4">
              <p className="mb-3 text-sm leading-relaxed">
                ¿Borrar «{entry.source_name}»? Esta acción no se puede deshacer.
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
              className="text-destructive hover:bg-destructive/5 hover:text-destructive w-full"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar entrada
            </Button>
          )}
        </section>
      </div>
    </SubPage>
  );
}
