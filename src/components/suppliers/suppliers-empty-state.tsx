export function SuppliersEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-base font-medium text-foreground">אין ספקים להצגה</p>
      <p className="mt-2 text-sm text-muted-foreground">
        כשייווצרו ספקים במערכת, הם יופיעו כאן.
      </p>
    </div>
  );
}
