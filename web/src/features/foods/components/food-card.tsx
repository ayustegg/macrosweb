import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Food } from "@/types/food";

interface Props {
  food: Food & { isLocal?: boolean };
  onSelect?: (food: Food) => void;
}

const sourceStyles: Record<string, string> = {
  custom:
    "bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
  off: "bg-zinc-100 text-zinc-500 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 dark:bg-zinc-800 dark:text-zinc-400",
};

export function FoodCard({ food, onSelect }: Props) {
  const tag = food.source === "custom" ? "custom" : "off";

  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={() => onSelect?.(food)}
    >
      <Card size="sm" className="hover:bg-muted/50 transition-colors">
        <CardContent className="flex items-center gap-3">
          {food.image_url ? (
            <Image
              src={food.image_url}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg">
              🍽️
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{food.name}</span>
              {food.brand && (
                <span className="truncate text-xs text-zinc-400">
                  {food.brand}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
              <span>{food.kcal} kcal</span>
              <span>/ 100g</span>
            </div>
          </div>
          <span className={sourceStyles[tag]}>
            {tag === "custom" ? "Propio" : "OFF"}
          </span>
        </CardContent>
      </Card>
    </button>
  );
}
