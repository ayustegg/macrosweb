"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryActions } from "@/features/meals/components/entry-actions";
import { useSwipeDelete } from "@/hooks/use-swipe-delete";
import type { Entry } from "@/types/entry";
import type { SlotTotals } from "@/features/meals/queries";
import type { MealSlot } from "@/features/meals/types";

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
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{slotName}</h3>
          <span className="text-muted-foreground text-sm">
            {Math.round(slotData.totals.kcal)} kcal
          </span>
        </div>

        {/* Entries */}
        <div className="divide-y">
          {slotData.entries.map((entry) => (
            <SwipeableEntry
              key={entry.id}
              entry={entry}
              onDelete={onDeleteEntry}
              onEdit={() => setEditingEntry(entry)}
            />
          ))}
        </div>

        {/* Add button */}
        <div className="border-t px-4 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground w-full justify-start gap-2"
            asChild
          >
            <Link href={`/foods/search?slot=${slotId}&date=${date}`}>
              <Plus className="h-4 w-4" />
              Añadir
            </Link>
          </Button>
        </div>
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
}: {
  entry: Entry;
  onDelete?: (entryId: string) => void;
  onEdit: () => void;
}) {
  const { offsetX, handlers } = useSwipeDelete(() => onDelete?.(entry.id), 80);

  return (
    <div className="relative overflow-hidden" {...handlers}>
      {/* Delete background layer */}
      <div className="bg-destructive absolute inset-0 flex items-center justify-end pr-4">
        <Trash2 className="text-destructive-foreground h-5 w-5" />
      </div>

      {/* Entry button with swipe offset */}
      <button
        type="button"
        className="hover:bg-muted/50 bg-card relative flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors"
        onClick={onEdit}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: offsetX === 0 ? "transform 250ms ease-out" : "none",
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{entry.source_name}</p>
          <p className="text-muted-foreground text-xs">
            {entry.quantity} {entry.unit === "serving" ? "porc" : entry.unit}
          </p>
        </div>
        <span className="text-muted-foreground ml-3 shrink-0 text-sm tabular-nums">
          {Math.round(entry.kcal)}
        </span>
      </button>
    </div>
  );
}
