"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { updateEntry, deleteEntry } from "@/features/meals/actions";
import type { Entry } from "@/types/entry";

interface Slot {
  id: string;
  name: string;
}

interface Props {
  entry: Entry;
  allSlots: Slot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (entry: Entry) => void;
  onDelete?: (entryId: string) => void;
  onMove?: (entryId: string, newSlotId: string) => void;
  onRollback?: () => void;
}

function scaleEntry(entry: Entry, quantity: number, unit: string): Entry {
  const ratio = entry.quantity > 0 ? quantity / entry.quantity : 1;
  return {
    ...entry,
    quantity,
    unit: unit as Entry["unit"],
    kcal: Math.round(entry.kcal * ratio * 100) / 100,
    protein_g: Math.round(entry.protein_g * ratio * 100) / 100,
    carbs_g: Math.round(entry.carbs_g * ratio * 100) / 100,
    fat_g: Math.round(entry.fat_g * ratio * 100) / 100,
  };
}

export function EntryActions({
  entry,
  allSlots,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onMove,
  onRollback,
}: Props) {
  const [quantity, setQuantity] = useState(String(entry.quantity));
  const [unit, setUnit] = useState(entry.unit);
  const [moveSlotId, setMoveSlotId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // State initialised from entry prop – no effect needed

  const qtyNum = Number(quantity) || 0;

  const otherSlots = useMemo(
    () => allSlots.filter((s) => s.id !== entry.meal_slot_id),
    [allSlots, entry.meal_slot_id]
  );

  const hasChanges =
    qtyNum > 0 && (qtyNum !== entry.quantity || unit !== entry.unit);

  async function handleSave() {
    if (qtyNum <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    const updated = scaleEntry(entry, qtyNum, unit);
    onUpdate?.(updated);

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("quantity", String(qtyNum));
      formData.set("unit", unit);

      const result = await updateEntry(entry.id, formData);
      if (!result.ok) {
        onRollback?.();
        toast.error(result.error);
        return;
      }

      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMove() {
    if (!moveSlotId) return;

    onMove?.(entry.id, moveSlotId);

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("meal_slot_id", moveSlotId);

      const result = await updateEntry(entry.id, formData);
      if (!result.ok) {
        onRollback?.();
        toast.error(result.error);
        return;
      }

      toast.success("Entrada movida");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    onDelete?.(entry.id);

    setSubmitting(true);
    try {
      const result = await deleteEntry(entry.id);
      if (!result.ok) {
        onRollback?.();
        toast.error(result.error);
        return;
      }

      setDeleteConfirm(false);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  const unitLabel =
    { g: "gramos", ml: "mililitros", serving: "porciones" }[unit] ?? unit;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{entry.source_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Edit quantity/unit */}
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Cantidad
              </h4>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="ea-quantity" className="text-sm">
                    Cantidad
                  </Label>
                  <Input
                    id="ea-quantity"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="w-28 space-y-2">
                  <Label htmlFor="ea-unit" className="text-sm">
                    Unidad
                  </Label>
                  <Select
                    value={unit}
                    onValueChange={(v) => setUnit(v as "g" | "ml" | "serving")}
                  >
                    <SelectTrigger id="ea-unit" className="w-full">
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

              <div className="bg-muted/30 flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  {qtyNum > 0 ? `${qtyNum} ${unitLabel}` : entry.source_name}
                </span>
                <span className="font-medium tabular-nums">
                  {Math.round(
                    entry.kcal * (qtyNum > 0 ? qtyNum / entry.quantity : 1)
                  )}{" "}
                  kcal
                </span>
              </div>

              {hasChanges && (
                <Button
                  className="w-full"
                  disabled={submitting || qtyNum <= 0}
                  onClick={handleSave}
                >
                  {submitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              )}
            </div>

            <Separator />

            {/* Move to another slot */}
            {otherSlots.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Mover a otro momento
                </h4>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="ea-move-slot" className="text-sm">
                      Mover a...
                    </Label>
                    <Select value={moveSlotId} onValueChange={setMoveSlotId}>
                      <SelectTrigger id="ea-move-slot" className="w-full">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {otherSlots.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

            <Separator />

            {/* Delete */}
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Eliminar
              </h4>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteConfirm(true)}
              >
                Eliminar entrada
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar entrada</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Borrar &ldquo;{entry.source_name} {entry.quantity}
              {entry.unit === "serving" ? "porc" : entry.unit}&rdquo;? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Button variant="outline">Cancelar</Button>
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              <Button variant="destructive" disabled={submitting}>
                {submitting ? "Eliminando..." : "Borrar"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
