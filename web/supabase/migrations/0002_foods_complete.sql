-- 0002_foods_complete.sql
-- Completa foods con campos faltantes para Fase 2

ALTER TABLE public.foods
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS off_id TEXT;

-- off_id suele ser el barcode, pero lo separamos para
-- poder referenciar la ficha de OFF incluso si cambia el barcode
CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_off_id ON public.foods (off_id)
  WHERE off_id IS NOT NULL;
