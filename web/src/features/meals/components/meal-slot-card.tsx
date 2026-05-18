"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryActions } from "@/features/meals/components/entry-actions";
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
            <button
              key={entry.id}
              type="button"
              className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors"
              onClick={() => setEditingEntry(entry)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {entry.source_name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {entry.quantity}{" "}
                  {entry.unit === "serving" ? "porc" : entry.unit}
                </p>
              </div>
              <span className="text-muted-foreground ml-3 shrink-0 text-sm tabular-nums">
                {Math.round(entry.kcal)}
              </span>
            </button>
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
            <Link href={`/foods/search?slot=${slotId}`}>
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
