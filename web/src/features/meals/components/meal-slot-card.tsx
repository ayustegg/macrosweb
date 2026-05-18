"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";
import { EntryActions } from "@/features/meals/components/entry-actions";
import { deleteEntry } from "@/features/meals/actions";
import { useSwipeDelete } from "@/hooks/use-swipe-delete";
import type { Entry } from "@/types/entry";
import type { SlotTotals } from "@/features/meals/queries";
import type { MealSlot } from "@/features/meals/types";

function MacroDots({ entry }: { entry: Entry }) {
  const items = [
    { value: entry.protein_g, color: "var(--macro-pro)" },
    { value: entry.carbs_g, color: "var(--macro-car)" },
    { value: entry.fat_g, color: "var(--macro-fat)" },
  ];
  return (
    <span className="inline-flex items-center gap-1">
      {items.map((d, i) => (
        <span key={i} className="inline-flex items-center gap-0.5">
          <span
            className="size-[5px] rounded-full"
            style={{ background: d.color }}
          />
          <span className="num text-[11px]">{Math.round(d.value)}</span>
        </span>
      ))}
    </span>
  );
}

interface SlotEntries {
  entries: Entry[];
  totals: SlotTotals;
}

interface Props {
  slotId: string;
  slotName: string;
  slotData: SlotEntries;
  date: string;
  allSlots?: MealSlot[];
  onUpdateEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
  onMoveEntry?: (entryId: string, newSlotId: string) => void;
  onRollback?: () => void;
}

export function MealSlotCard({
  slotId,
  slotName,
  slotData,
  date,
  allSlots = [],
  onUpdateEntry,
  onDeleteEntry,
  onMoveEntry,
  onRollback,
}: Props) {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  return (
    <>
      <div
        className="overflow-hidden rounded-[22px] border border-border bg-card shadow-app-1"
        style={{ marginBottom: "var(--slot-gap)" }}
      >
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-secondary text-accent-foreground">
              <Utensils className="size-4" strokeWidth={1.75} />
            </div>
            <h3 className="text-[15px] font-semibold">{slotName}</h3>
          </div>
          <span className="num text-sm font-semibold text-muted-foreground">
            {Math.round(slotData.totals.kcal)}{" "}
            <span className="font-medium">kcal</span>
          </span>
        </div>

        {slotData.entries.length === 0 ? (
          <p className="px-4 pb-3 text-[13px] font-medium text-muted-foreground">
            Nada registrado aún
          </p>
        ) : (
          <div>
            {slotData.entries.map((entry) => (
              <SwipeableEntry
                key={entry.id}
                entry={entry}
                onDelete={onDeleteEntry}
                onEdit={() => setEditingEntry(entry)}
                onRollback={onRollback}
              />
            ))}
          </div>
        )}

        <Link
          href={`/foods/search?slot=${slotId}&date=${date}`}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border/80 py-3 text-[13.5px] font-semibold text-accent-foreground transition-colors hover:bg-secondary/50"
        >
          <Plus className="size-4" />
          Añadir alimento
        </Link>
      </div>

      {editingEntry && (
        <EntryActions
          key={editingEntry.id}
          entry={editingEntry}
          allSlots={allSlots}
          open={!!editingEntry}
          onOpenChange={(open) => {
            if (!open) setEditingEntry(null);
          }}
          onUpdate={onUpdateEntry}
          onDelete={onDeleteEntry}
          onMove={onMoveEntry}
          onRollback={onRollback}
        />
      )}
    </>
  );
}

function SwipeableEntry({
  entry,
  onDelete,
  onEdit,
  onRollback,
}: {
  entry: Entry;
  onDelete?: (entryId: string) => void;
  onEdit: () => void;
  onRollback?: () => void;
}) {
  const { offsetX, handlers } = useSwipeDelete(async () => {
    onDelete?.(entry.id);
    const result = await deleteEntry(entry.id);
    if (!result.ok) {
      onRollback?.();
      toast.error(result.error);
    }
  }, 88);

  return (
    <div className="relative overflow-hidden" {...handlers}>
      <div className="bg-destructive absolute inset-0 flex items-stretch justify-end">
        <div className="flex w-[88px] flex-col items-center justify-center gap-1 text-destructive-foreground">
          <Trash2 className="h-[18px] w-[18px]" />
          <span className="text-[13px] font-semibold">Borrar</span>
        </div>
      </div>

      <button
        type="button"
        className="relative flex w-full items-start justify-between gap-3 border-t border-border/80 bg-card px-4 py-2.5 text-left transition-transform"
        onClick={onEdit}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: offsetX === 0 ? "transform 250ms cubic-bezier(0.2,0.7,0.3,1)" : "none",
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-medium leading-snug">
            {entry.source_name}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="num">
              {entry.quantity} {entry.unit === "serving" ? "porc" : entry.unit}
            </span>
            <span>·</span>
            <MacroDots entry={entry} />
          </div>
        </div>
        <span className="num shrink-0 text-sm font-semibold whitespace-nowrap">
          {Math.round(entry.kcal)}{" "}
          <span className="font-medium text-muted-foreground">kcal</span>
        </span>
      </button>
    </div>
  );
}
