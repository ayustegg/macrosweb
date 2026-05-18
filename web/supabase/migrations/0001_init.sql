-- 0001_init.sql
-- Schema base: profiles, weight_logs, goals, meal_slots, foods, recipes, recipe_items, day_logs, entries

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLES
-- ============================================================

-- 1. profiles — extends auth.users 1:1
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  birth_date DATE,
  height_cm NUMERIC(5,1) CHECK (height_cm >= 50 AND height_cm <= 250),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  avatar_url TEXT,
  profile_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. weight_logs — body weight records
CREATE TABLE public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg >= 20 AND weight_kg <= 500),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. goals — daily macro goals with valid_from/valid_to (NULL valid_to = active)
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valid_from DATE NOT NULL,
  valid_to DATE,
  kcal NUMERIC(6,2) NOT NULL CHECK (kcal >= 0),
  protein_g NUMERIC(6,2) NOT NULL CHECK (protein_g >= 0),
  carbs_g NUMERIC(6,2) NOT NULL CHECK (carbs_g >= 0),
  fat_g NUMERIC(6,2) NOT NULL CHECK (fat_g >= 0),
  is_auto BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. meal_slots — configurable meal names per user ("Desayuno", "Comida", etc.)
CREATE TABLE public.meal_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. foods — atomic food items (public off or custom per user)
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('off', 'custom')),
  barcode TEXT,
  name TEXT NOT NULL,
  serving_size_g NUMERIC(8,2) NOT NULL DEFAULT 100 CHECK (serving_size_g > 0),
  serving_name TEXT,
  density_g_per_ml NUMERIC(8,4),
  kcal NUMERIC(6,2) NOT NULL CHECK (kcal >= 0),
  protein_g NUMERIC(6,2) NOT NULL CHECK (protein_g >= 0),
  carbs_g NUMERIC(6,2) NOT NULL CHECK (carbs_g >= 0),
  fat_g NUMERIC(6,2) NOT NULL CHECK (fat_g >= 0),
  nutrients JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  off_last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. recipes — composición viva de alimentos
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  servings NUMERIC(6,2) NOT NULL DEFAULT 1 CHECK (servings > 0),
  serving_name TEXT NOT NULL DEFAULT 'serving',
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. recipe_items — ingredients within a recipe
CREATE TABLE public.recipe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  quantity NUMERIC(8,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (unit IN ('g', 'ml', 'serving')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. day_logs — one row per user per local date
CREATE TABLE public.day_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_kcal NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (total_kcal >= 0),
  total_protein_g NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (total_protein_g >= 0),
  total_carbs_g NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (total_carbs_g >= 0),
  total_fat_g NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (total_fat_g >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_owner_date UNIQUE (owner_id, date)
);

-- 9. entries — snapshot inmutable de algo comido
CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_log_id UUID NOT NULL REFERENCES public.day_logs(id) ON DELETE CASCADE,
  meal_slot_id UUID REFERENCES public.meal_slots(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('food', 'recipe')),
  source_id UUID,
  source_name TEXT NOT NULL,
  quantity NUMERIC(8,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (unit IN ('g', 'ml', 'serving')),
  kcal NUMERIC(6,2) NOT NULL CHECK (kcal >= 0),
  protein_g NUMERIC(6,2) NOT NULL CHECK (protein_g >= 0),
  carbs_g NUMERIC(6,2) NOT NULL CHECK (carbs_g >= 0),
  fat_g NUMERIC(6,2) NOT NULL CHECK (fat_g >= 0),
  nutrients JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- owner_id indexes for all user-owned tables
CREATE INDEX idx_weight_logs_owner_id ON public.weight_logs (owner_id);
CREATE INDEX idx_goals_owner_id ON public.goals (owner_id);
CREATE INDEX idx_meal_slots_owner_id ON public.meal_slots (owner_id);
CREATE INDEX idx_foods_owner_id ON public.foods (owner_id)
  WHERE owner_id IS NOT NULL;
CREATE INDEX idx_recipes_owner_id ON public.recipes (owner_id);
CREATE INDEX idx_day_logs_owner_id ON public.day_logs (owner_id);

-- composite indexes for common query patterns
CREATE INDEX idx_day_logs_owner_date ON public.day_logs (owner_id, date DESC);
CREATE INDEX idx_entries_order ON public.entries (day_log_id, meal_slot_id, position);

-- partial unique index: only one active goal per user
CREATE UNIQUE INDEX idx_one_active_goal_per_user ON public.goals (owner_id)
  WHERE valid_to IS NULL;

-- GIN indexes for JSONB nutrients queries
CREATE INDEX idx_foods_nutrients ON public.foods USING GIN (nutrients);
CREATE INDEX idx_entries_nutrients ON public.entries USING GIN (nutrients);

-- trigram index for fuzzy name search
CREATE INDEX idx_foods_name_trgm ON public.foods USING GIN (name gin_trgm_ops);

-- barcode lookups (exact match)
CREATE INDEX idx_foods_barcode ON public.foods (barcode)
  WHERE barcode IS NOT NULL;

-- entries filtered by meal slot
CREATE INDEX idx_entries_meal_slot_id ON public.entries (meal_slot_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_meal_slots_updated_at
  BEFORE UPDATE ON public.meal_slots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_day_logs_updated_at
  BEFORE UPDATE ON public.day_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_auth_users_after_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- profiles: user owns row with same id
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- weight_logs
CREATE POLICY "weight_logs_select_own" ON public.weight_logs
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "weight_logs_insert_own" ON public.weight_logs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "weight_logs_update_own" ON public.weight_logs
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "weight_logs_delete_own" ON public.weight_logs
  FOR DELETE USING (auth.uid() = owner_id);

-- goals
CREATE POLICY "goals_select_own" ON public.goals
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "goals_insert_own" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "goals_update_own" ON public.goals
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "goals_delete_own" ON public.goals
  FOR DELETE USING (auth.uid() = owner_id);

-- meal_slots
CREATE POLICY "meal_slots_select_own" ON public.meal_slots
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "meal_slots_insert_own" ON public.meal_slots
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "meal_slots_update_own" ON public.meal_slots
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "meal_slots_delete_own" ON public.meal_slots
  FOR DELETE USING (auth.uid() = owner_id);

-- foods: public off foods readable by all authenticated; custom foods owner-only
-- off/owner_id=NULL are inserted via service_role (bypasses RLS)
CREATE POLICY "foods_select" ON public.foods
  FOR SELECT USING (
    (source = 'off' AND owner_id IS NULL)
    OR auth.uid() = owner_id
  );
CREATE POLICY "foods_insert_own" ON public.foods
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "foods_update_own" ON public.foods
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "foods_delete_own" ON public.foods
  FOR DELETE USING (auth.uid() = owner_id);

-- recipes
CREATE POLICY "recipes_select_own" ON public.recipes
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "recipes_insert_own" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "recipes_update_own" ON public.recipes
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "recipes_delete_own" ON public.recipes
  FOR DELETE USING (auth.uid() = owner_id);

-- recipe_items: access delegated through recipe owner
CREATE POLICY "recipe_items_select" ON public.recipe_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_items.recipe_id
      AND recipes.owner_id = auth.uid()
    )
  );
CREATE POLICY "recipe_items_insert" ON public.recipe_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_items.recipe_id
      AND recipes.owner_id = auth.uid()
    )
  );
CREATE POLICY "recipe_items_update" ON public.recipe_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_items.recipe_id
      AND recipes.owner_id = auth.uid()
    )
  );
CREATE POLICY "recipe_items_delete" ON public.recipe_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.recipes
      WHERE recipes.id = recipe_items.recipe_id
      AND recipes.owner_id = auth.uid()
    )
  );

-- day_logs
CREATE POLICY "day_logs_select_own" ON public.day_logs
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "day_logs_insert_own" ON public.day_logs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "day_logs_update_own" ON public.day_logs
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "day_logs_delete_own" ON public.day_logs
  FOR DELETE USING (auth.uid() = owner_id);

-- entries: access delegated through day_log owner
CREATE POLICY "entries_select" ON public.entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.day_logs
      WHERE day_logs.id = entries.day_log_id
      AND day_logs.owner_id = auth.uid()
    )
  );
CREATE POLICY "entries_insert" ON public.entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.day_logs
      WHERE day_logs.id = entries.day_log_id
      AND day_logs.owner_id = auth.uid()
    )
  );
CREATE POLICY "entries_update" ON public.entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.day_logs
      WHERE day_logs.id = entries.day_log_id
      AND day_logs.owner_id = auth.uid()
    )
  );
CREATE POLICY "entries_delete" ON public.entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.day_logs
      WHERE day_logs.id = entries.day_log_id
      AND day_logs.owner_id = auth.uid()
    )
  );
