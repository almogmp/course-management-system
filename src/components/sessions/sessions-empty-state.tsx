export function SessionsEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-base font-medium text-foreground">אין מפגשים להצגה</p>
      <p className="mt-2 text-sm text-muted-foreground">
        כשייווצרו מפגשים במערכת, הם יופיעו כאן.
      </p>
    </div>
  );
}
