-- Institution ↔ supplier linkage, soft-delete flags, course archived status

ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS primary_supplier_id UUID REFERENCES public.primary_suppliers (id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS is_own_supplier BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.primary_suppliers
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.instructors
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Backfill institution supplier from an existing course for that institution
UPDATE public.institutions AS i
SET primary_supplier_id = sub.primary_supplier_id
FROM (
  SELECT DISTINCT ON (c.institution_id)
    c.institution_id,
    c.primary_supplier_id
  FROM public.courses AS c
  ORDER BY c.institution_id, c.created_at ASC
) AS sub
WHERE i.id = sub.institution_id
  AND i.primary_supplier_id IS NULL;

ALTER TYPE public.course_status ADD VALUE IF NOT EXISTS 'archived';

COMMENT ON COLUMN public.institutions.primary_supplier_id IS 'Supplier that contracts with this institution';
COMMENT ON COLUMN public.institutions.is_own_supplier IS 'When true, institution acts as its own supplier for operational grouping';
COMMENT ON COLUMN public.institutions.is_active IS 'Soft delete — inactive institutions hidden from active UI';
