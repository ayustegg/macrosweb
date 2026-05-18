"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
  return formatter.format(new Date());
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
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSubline(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface SwipeState {
  startX: number;
  startY: number;
}

export function DayNavigator({ date, timezone = "UTC" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [calendarOpen, setCalendarOpen] = useState(false);
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
  const subline = formatSubline(date);

  return (
    <div
      className="mb-3.5"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToRelative(-1)}
          aria-label="Día anterior"
          className="size-10 rounded-full"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </Button>

        <button
          type="button"
          onClick={() => setCalendarOpen((o) => !o)}
          className="flex flex-col items-center gap-1 text-center outline-none"
          aria-expanded={calendarOpen}
          aria-label="Elegir fecha"
        >
          <span className="num text-[19px] leading-tight font-semibold capitalize">
            {label}
          </span>
          <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {subline}
          </span>
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToRelative(1)}
          disabled={!canGoForward}
          aria-label="Día siguiente"
          className="size-10 rounded-full disabled:opacity-40"
        >
          <ChevronRight className="h-[22px] w-[22px]" />
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          calendarOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-border bg-card shadow-app-1 mt-3 flex justify-center rounded-[18px] border p-2">
            <Calendar
              mode="single"
              selected={new Date(date + "T12:00:00")}
              onSelect={(day) => {
                if (!day) return;
                const dateStr =
                  day.getFullYear() +
                  "-" +
                  String(day.getMonth() + 1).padStart(2, "0") +
                  "-" +
                  String(day.getDate()).padStart(2, "0");
                if (dateStr <= today) {
                  goTo(dateStr);
                  setCalendarOpen(false);
                }
              }}
              disabled={[{ after: new Date(today + "T12:00:00") }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
