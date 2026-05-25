type SessionsEmptyStateProps = {
  message?: string;
};

export function SessionsEmptyState({
  message = "אין מפגשים להצגה",
}: SessionsEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-base font-medium text-foreground">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        ניתן לבחור חודש אחר באמצעות בורר החודש למעלה.
      </p>
    </div>
  );
}
