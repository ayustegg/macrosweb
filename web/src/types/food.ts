export interface Food {
  id: string;
  owner_id: string | null;
  source: "off" | "custom";
  brand: string | null;
  barcode: string | null;
  off_id: string | null;
  name: string;
  serving_size_g: number;
  serving_name: string | null;
  density_g_per_ml: number | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  nutrients: Record<string, number>;
  image_url: string | null;
  off_last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}
