import { cn } from "@/lib/utils";

export type DashboardFinancialCard = {
  key: string;
  title: string;
  value: string;
  emphasized?: boolean;
};

type DashboardFinancialCardGridProps = {
  cards: DashboardFinancialCard[];
  columns: 3 | 6;
};

export function DashboardFinancialCardGrid({
  cards,
  columns,
}: DashboardFinancialCardGridProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <div
        className={cn(
          "grid gap-3",
          columns === 6
            ? "min-w-[56rem] grid-cols-6 lg:min-w-0"
            : "min-w-[28rem] grid-cols-3 md:min-w-0",
        )}
      >
        {cards.map((card) => (
          <article
            key={card.key}
            className={cn(
              "min-w-0 rounded-xl border bg-surface p-4 sm:p-5",
              card.emphasized
                ? "border-primary/40 ring-1 ring-primary/15"
                : "border-border",
            )}
          >
            <h3 className="text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
              {card.title}
            </h3>
            <p className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {card.value}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
