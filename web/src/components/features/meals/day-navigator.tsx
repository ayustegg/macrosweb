"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  COLLAPSE_GRID,
  COLLAPSE_INNER,
  collapseInnerClass,
} from "@/lib/collapse-transition";
import { cn } from "@/lib/utils";
import { useHeaderBrandMotion } from "@/components/layout/header-brand-motion-provider";

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

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function formatSubline(dateStr: string, today: string): string {
  const diff = diffDays(dateStr, today);
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === -2) return "Anteayer";
  if (diff === 1) return "Mañana";

  const d = new Date(dateStr + "T12:00:00");
  const year = d.getFullYear();
  const todayYear = new Date(today + "T12:00:00").getFullYear();
  if (year !== todayYear) return String(year);

  return d.toLocaleDateString("es", { month: "long", year: "numeric" });
}

interface SwipeState {
  startX: number;
  startY: number;
}

export function DayNavigator({ date, timezone = "UTC" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startDateNavigation } = useHeaderBrandMotion();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(date);
  const swipeRef = useRef<SwipeState | null>(null);
  const today = todayInTimezone(timezone);
  const canGoForward = displayDate < today;

  const goTo = useCallback(
    (target: string) => {
      if (target === displayDate) return;
      setDisplayDate(target);
      startDateNavigation(target);
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", target);
      router.push(`?${params.toString()}`);
    },
    [displayDate, router, searchParams, startDateNavigation]
  );

  const goToRelative = useCallback(
    (n: number) => {
      const target = addDays(displayDate, n);
      if (target <= today) goTo(target);
    },
    [displayDate, goTo, today]
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

  const label = formatLabel(displayDate);
  const subline = formatSubline(displayDate, today);

  return (
    <section
      className="border-border bg-card shadow-app-1 mb-3.5 overflow-hidden rounded-[22px] border"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-1 py-1">
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
          className="hover:bg-muted/60 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-center transition-colors outline-none"
          aria-expanded={calendarOpen}
          aria-label="Elegir fecha"
        >
          <span className="num text-[19px] leading-tight font-semibold capitalize">
            {label}
          </span>
          {subline ? (
            <span
              className={cn(
                "text-[11px] font-medium tracking-wide uppercase",
                subline === "Hoy" ? "text-macro-kcal" : "text-muted-foreground"
              )}
            >
              {subline}
            </span>
          ) : null}
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
          COLLAPSE_GRID,
          calendarOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className={cn(COLLAPSE_INNER, collapseInnerClass(calendarOpen))}>
          <div className="border-border border-t px-2 pt-1 pb-2">
            <Calendar
              className="w-full [--cell-size:--spacing(9)]"
              mode="single"
              selected={new Date(displayDate + "T12:00:00")}
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
    </section>
  );
}
