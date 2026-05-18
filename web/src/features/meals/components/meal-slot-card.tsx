"use client";

import Link from "next/link";
import { Plus, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";
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
  onDeleteEntry?: (entryId: string) => void;
  onRollback?: () => void;
}

export function MealSlotCard({
  slotId,
  slotName,
  slotData,
  date,
  onDeleteEntry,
  onRollback,
}: Props) {
  return (
    <div
      className="border-border bg-card shadow-app-1 overflow-hidden rounded-[22px] border"
      style={{ marginBottom: "var(--slot-gap)" }}
    >
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="bg-secondary text-accent-foreground flex size-7 items-center justify-center rounded-lg">
            <Utensils className="size-4" strokeWidth={1.75} />
          </div>
          <h3 className="text-[15px] font-semibold">{slotName}</h3>
        </div>
        <span className="num text-muted-foreground text-sm font-semibold">
          {Math.round(slotData.totals.kcal)}{" "}
          <span className="font-medium">kcal</span>
        </span>
      </div>

      {slotData.entries.length === 0 ? (
        <p className="text-muted-foreground px-4 pb-3 text-[13px] font-medium">
          Nada registrado aún
        </p>
      ) : (
        <div>
          {slotData.entries.map((entry) => (
            <SwipeableEntry
              key={entry.id}
              entry={entry}
              date={date}
              onDelete={onDeleteEntry}
              onRollback={onRollback}
            />
          ))}
        </div>
      )}

      <Link
        href={`/foods/search?slot=${slotId}&date=${date}`}
        className="border-border/80 text-accent-foreground hover:bg-secondary/50 flex w-full items-center justify-center gap-1.5 border-t py-3 text-[13.5px] font-semibold transition-colors"
      >
        <Plus className="size-4" />
        Añadir alimento
      </Link>
    </div>
  );
}

function SwipeableEntry({
  entry,
  date,
  onDelete,
  onRollback,
}: {
  entry: Entry;
  date: string;
  onDelete?: (entryId: string) => void;
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

  const editHref = `/today/entry/${entry.id}/edit?date=${date}`;

  return (
    <div className="relative overflow-hidden" {...handlers}>
      <div className="bg-destructive absolute inset-0 flex items-stretch justify-end">
        <div className="text-destructive-foreground flex w-[88px] flex-col items-center justify-center gap-1">
          <Trash2 className="h-[18px] w-[18px]" />
          <span className="text-[13px] font-semibold">Borrar</span>
        </div>
      </div>

      <Link
        href={editHref}
        className="border-border/80 bg-card active:bg-secondary/30 relative flex w-full items-start justify-between gap-3 border-t px-4 py-2.5 text-left transition-transform"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition:
            offsetX === 0
              ? "transform 250ms cubic-bezier(0.2,0.7,0.3,1)"
              : "none",
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] leading-snug font-medium">
            {entry.source_name}
          </p>
          <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-[11px] font-medium">
            <span className="num">
              {entry.quantity} {entry.unit === "serving" ? "porc" : entry.unit}
            </span>
            <span>·</span>
            <MacroDots entry={entry} />
          </div>
        </div>
        <span className="num shrink-0 text-sm font-semibold whitespace-nowrap">
          {Math.round(entry.kcal)}{" "}
          <span className="text-muted-foreground font-medium">kcal</span>
        </span>
      </Link>
    </div>
  );
}
