"use client";

import { useState } from "react";
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
import { updateEntry, deleteEntry } from "@/features/meals/actions";
import type { Entry } from "@/types/entry";

interface Props {
  entry: Entry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EntryActions({ entry, open, onOpenChange, onUpdated }: Props) {
  const [quantity, setQuantity] = useState(String(entry.quantity));
  const [unit, setUnit] = useState(entry.unit);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  async function handleSave() {
    const qty = Number(quantity);
    if (qty <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("quantity", quantity);
      formData.set("unit", unit);

      const result = await updateEntry(entry.id, formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Entrada actualizada");
      onOpenChange(false);
      onUpdated?.();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      const result = await deleteEntry(entry.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Entrada eliminada");
      setDeleteConfirm(false);
      onOpenChange(false);
      onUpdated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{entry.source_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ea-quantity">Cantidad</Label>
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

            <div className="space-y-2">
              <Label htmlFor="ea-unit">Unidad</Label>
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

            <div className="flex items-center justify-between rounded-lg border bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
              <span className="text-zinc-500">{entry.source_name}</span>
              <span className="font-medium">{entry.kcal} kcal</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setDeleteConfirm(true)}
                disabled={submitting}
              >
                Eliminar
              </Button>
              <Button
                className="flex-1"
                disabled={submitting}
                onClick={handleSave}
              >
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar entrada</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar &ldquo;{entry.source_name}&rdquo;? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
