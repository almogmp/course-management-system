import { Container } from "@/components/ui/container";
import { CardSkeleton, Skeleton } from "@/components/ui/loading-skeleton";

export function DashboardPageSkeleton() {
  return (
    <Container as="main" className="flex flex-1 flex-col gap-8 py-8" aria-busy="true" aria-label="טוען דשבורד">
      <header className="space-y-2 text-start">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </header>
      <Skeleton className="h-10 w-full max-w-md" />
      <CardSkeleton lines={4} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} lines={2} />
        ))}
      </div>
      <CardSkeleton lines={6} />
    </Container>
  );
}

export function CalendarSectionSkeleton() {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="טוען יומן">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-32 w-full max-w-xl rounded-xl" />
      </div>
      <div className="hidden gap-2 md:grid md:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="min-h-52 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} lines={3} />
        ))}
      </div>
    </section>
  );
}

export function OperationalSectionsSkeleton() {
  return (
    <section className="space-y-6" aria-busy="true" aria-label="טוען תפעול יומי">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-6 w-56" />
          <CardSkeleton lines={3} />
        </div>
      ))}
    </section>
  );
}

export function SessionsPageSkeleton() {
  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8" aria-busy="true" aria-label="טוען מפגשים">
      <Skeleton className="h-8 w-64" />
      <CardSkeleton lines={5} />
      <CardSkeleton lines={5} />
    </Container>
  );
}
