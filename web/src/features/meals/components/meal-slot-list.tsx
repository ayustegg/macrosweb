"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  GripVertical,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmPanel } from "@/components/layout/page-chrome";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  renameSlot,
  addSlot,
  reorderSlots,
  deleteSlot,
} from "@/features/meals/actions";
import type { MealSlot } from "@/features/meals/types";

interface Props {
  initialSlots: MealSlot[];
}

export function MealSlotList({ initialSlots }: Props) {
  const [slots, setSlots] = useState<MealSlot[]>(initialSlots);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MealSlot | null>(null);
  const [migrateToId, setMigrateToId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = useCallback((slot: MealSlot) => {
    setEditingId(slot.id);
    setEditName(slot.name);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
  }, []);

  const handleSaveEdit = useCallback(
    async (id: string) => {
      if (!editName.trim()) return;
      const formData = new FormData();
      formData.set("id", id);
      formData.set("name", editName.trim());
      const result = await renameSlot(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: editName.trim() } : s))
      );
      setEditingId(null);
      toast.success("Momento renombrado");
    },
    [editName]
  );

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const formData = new FormData();
    formData.set("name", newName.trim());
    const result = await addSlot(formData);
    if (!result.ok) {
      toast.error(result.error);
      setAdding(false);
      return;
    }
    setNewName("");
    setAdding(false);
    toast.success("Momento añadido");
  }, [newName]);

  const handleReorder = useCallback(async (ids: string[]) => {
    const formData = new FormData();
    formData.set("ids", JSON.stringify(ids));
    const result = await reorderSlots(formData);
    if (!result.ok) {
      toast.error(result.error);
    }
  }, []);

  const moveSlot = useCallback(
    (index: number, direction: -1 | 1) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= slots.length) return;
      const next = [...slots];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      next.forEach((s, i) => (s.order_index = i));
      setSlots(next);
      handleReorder(next.map((s) => s.id));
    },
    [slots, handleReorder]
  );

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;
      const next = [...slots];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      next.forEach((s, i) => (s.order_index = i));
      setSlots(next);
      setDragIndex(index);
    },
    [dragIndex, slots]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragIndex(null);
      handleReorder(slots.map((s) => s.id));
    },
    [slots, handleReorder]
  );

  const clearDelete = useCallback(() => {
    setDeleteTarget(null);
    setMigrateToId("");
    setNeedsMigration(false);
    setDeleting(false);
  }, []);

  const handleDeleteClick = useCallback((slot: MealSlot) => {
    setDeleteTarget(slot);
    setMigrateToId("");
    setNeedsMigration(false);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", deleteTarget.id);
    if (migrateToId) formData.set("migrateToId", migrateToId);

    const result = await deleteSlot(formData);
    if (!result.ok) {
      toast.error(result.error);
      setDeleting(false);
      return;
    }

    if (result.data?.hasEntries && !migrateToId) {
      setNeedsMigration(true);
      setDeleting(false);
      return;
    }

    setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    clearDelete();
    toast.success("Momento eliminado");
  }, [deleteTarget, migrateToId, clearDelete]);

  const handleMigrateAndDelete = useCallback(async () => {
    if (!deleteTarget || !migrateToId) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("id", deleteTarget.id);
    formData.set("migrateToId", migrateToId);

    const result = await deleteSlot(formData);
    if (!result.ok) {
      toast.error(result.error);
      setDeleting(false);
      return;
    }

    setSlots((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    clearDelete();
    toast.success("Entradas migradas y momento eliminado");
  }, [deleteTarget, migrateToId, clearDelete]);

  return (
    <div className="space-y-3">
      {slots.map((slot, i) => (
        <div
          key={slot.id}
          className="bg-card flex items-center gap-2 rounded-lg border px-3 py-2.5"
          draggable
          onDragStart={(e) => handleDragStart(e, i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={handleDrop}
        >
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
            aria-label="Arrastrar para reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => moveSlot(i, -1)}
              className="disabled:text-muted-foreground/30 text-muted-foreground hover:text-foreground"
              aria-label="Mover arriba"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={i === slots.length - 1}
              onClick={() => moveSlot(i, 1)}
              className="disabled:text-muted-foreground/30 text-muted-foreground hover:text-foreground"
              aria-label="Mover abajo"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1">
            {editingId === slot.id ? (
              <div className="flex items-center gap-1">
                <Input
                  ref={editRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(slot.id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-8 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleSaveEdit(slot.id)}
                  aria-label="Guardar"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCancelEdit}
                  aria-label="Cancelar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="hover:text-foreground flex items-center gap-1.5 text-sm font-medium"
                onClick={() => handleStartEdit(slot)}
              >
                {slot.name}
                <Pencil className="text-muted-foreground h-3 w-3" />
              </button>
            )}
          </div>

          {slots.length > 1 && editingId !== slot.id && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDeleteClick(slot)}
              aria-label="Eliminar momento"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nuevo momento..."
          className="h-9 text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={adding || !newName.trim()}
        >
          <Plus className="h-4 w-4" />
          Añadir
        </Button>
      </form>

      {deleteTarget && !needsMigration && (
        <ConfirmPanel
          title={`Eliminar «${deleteTarget.name}»`}
          description={
            slots.length <= 1
              ? "Debe haber al menos un momento del día. No se puede eliminar el último."
              : "Se eliminará este momento del día."
          }
          confirmLabel="Eliminar"
          destructive
          loading={deleting}
          onCancel={clearDelete}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {deleteTarget && needsMigration && (
        <div className="border-border bg-card shadow-app-1 space-y-4 rounded-[18px] border p-4">
          <div>
            <h3 className="text-[15px] font-semibold">Migrar entradas</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              «{deleteTarget.name}» tiene entradas registradas. Elige a qué
              momento moverlas antes de eliminarlo.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mover entradas a…</label>
            <Select value={migrateToId} onValueChange={setMigrateToId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {slots
                  .filter((s) => s.id !== deleteTarget.id)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={clearDelete}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleMigrateAndDelete}
              disabled={!migrateToId || deleting}
            >
              {deleting ? "Migrando…" : "Migrar y eliminar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
