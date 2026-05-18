"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  date: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

function isToday(dateStr: string): boolean {
  const d = new Date();
  const today =
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");
  return dateStr === today;
}

export function DayNavigator({ date }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goTo = useCallback(
    (target: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", target);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const prev = addDays(date, -1);
  const next = addDays(date, 1);

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => goTo(prev)}
        aria-label="Día anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="text-center">
        <p className="text-sm font-medium capitalize">{formatDate(date)}</p>
        {isToday(date) && <p className="text-muted-foreground text-xs">Hoy</p>}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => goTo(next)}
        disabled={isToday(date)}
        aria-label="Día siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
