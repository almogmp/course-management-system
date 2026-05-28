-- Expenses module (admin-only). Separate from financial reports/payroll/profit.

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  paid_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expenses_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT expenses_category_allowed CHECK (category IN ('ציוד','חומרים','נסיעות','תוכנה','הדפסות','אחר')),
  CONSTRAINT expenses_paid_by_allowed CHECK (paid_by IN ('אלמוג','שימי'))
);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses (expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses (paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expenses_select_admin ON public.expenses;
DROP POLICY IF EXISTS expenses_insert_admin ON public.expenses;
DROP POLICY IF EXISTS expenses_update_admin ON public.expenses;
DROP POLICY IF EXISTS expenses_delete_admin ON public.expenses;

CREATE POLICY expenses_select_admin
ON public.expenses
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY expenses_insert_admin
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY expenses_update_admin
ON public.expenses
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY expenses_delete_admin
ON public.expenses
FOR DELETE
TO authenticated
USING (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;

COMMENT ON TABLE public.expenses IS
  'Admin-only expenses tracking. Not included in revenue/profit/payroll calculations.';

