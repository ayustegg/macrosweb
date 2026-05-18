"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  date: string;
  timezone?: string;
}

function todayInTimezone(tz: string): string {
  const formatter = new Intl.DateTimeFormat("fr-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // fr-CA → YYYY-MM-DD
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

function formatLabel(dateStr: string, today: string): string {
  const diff = diffDays(dateStr, today);
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === -2) return "Anteayer";
  if (diff === 1) return "Mañana";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface SwipeState {
  startX: number;
  startY: number;
}

export function DayNavigator({ date, timezone = "UTC" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);
  const swipeRef = useRef<SwipeState | null>(null);
  const today = todayInTimezone(timezone);
  const canGoForward = date < today;

  const goTo = useCallback(
    (target: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", target);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const goToRelative = useCallback(
    (n: number) => {
      const target = addDays(date, n);
      if (target <= today) goTo(target);
    },
    [date, goTo, today]
  );

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeRef.current = {
      startX: e.touches[0]!.clientX,
      startY: e.touches[0]!.clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeRef.current) return;
      const dx = e.changedTouches[0]!.clientX - swipeRef.current.startX;
      const dy = e.changedTouches[0]!.clientY - swipeRef.current.startY;
      swipeRef.current = null;

      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      goToRelative(dx > 0 ? -1 : 1);
    },
    [goToRelative]
  );

  // Keyboard: left/right arrows
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft") goToRelative(-1);
      if (e.key === "ArrowRight") goToRelative(1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goToRelative]);

  const label = formatLabel(date, today);
  const shortLabel = diffDays(date, today) === 0 ? "" : formatShort(date);

  // Picker handlers: convert between string date and native input value
  const handlePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val && val <= today) {
        goTo(val);
        setPickerOpen(false);
      }
    },
    [goTo, today]
  );

  return (
    <div
      className="flex items-center justify-between"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => goToRelative(-1)}
        aria-label="Día anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 text-center outline-none"
          >
            <span className="text-sm font-semibold capitalize">{label}</span>
            {shortLabel && (
              <span className="text-muted-foreground text-xs">
                {shortLabel}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <input
            type="date"
            value={date}
            max={today}
            onChange={handlePickerChange}
            className="bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            aria-label="Seleccionar fecha"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => goToRelative(1)}
        disabled={!canGoForward}
        aria-label="Día siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
