export function InstitutionsEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-base font-medium text-foreground">אין מוסדות להצגה</p>
      <p className="mt-2 text-sm text-muted-foreground">
        כשייווצרו מוסדות במערכת, הם יופיעו כאן.
      </p>
    </div>
  );
}
