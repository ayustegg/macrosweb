"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function FoodSearchInput({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar alimentos…"
        className="h-10 pr-9 pl-9 text-base"
        autoComplete="off"
        autoFocus
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-2 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
