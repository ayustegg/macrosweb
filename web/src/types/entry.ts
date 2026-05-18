export interface Entry {
  id: string;
  day_log_id: string;
  meal_slot_id: string | null;
  source_type: "food" | "recipe";
  source_id: string | null;
  source_name: string;
  quantity: number;
  unit: "g" | "ml" | "serving";
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  nutrients: Record<string, number>;
  position: number;
  created_at: string;
}
