import { buildSessionsPageUrl } from "@/lib/sessions/sessions-page-url";
import { getSessionsPageData } from "@/lib/sessions/get-sessions-page-data";
import { SessionsEmptyState } from "@/components/sessions/sessions-empty-state";
import { SessionsList } from "@/components/sessions/sessions-list";
import { SessionsMonthFilter } from "@/components/sessions/sessions-month-filter";
import { SessionsMonthSummaryPanel } from "@/components/sessions/sessions-month-summary";
import { Container } from "@/components/ui/container";
import { requireAuth } from "@/lib/auth/guards";
import { getAuthSnapshot } from "@/lib/auth/session";

type SessionsPageProps = {
  searchParams?: {
    month?: string;
  };
};

export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  await requireAuth();
  const { isAdmin } = await getAuthSnapshot();

  const pageData = await getSessionsPageData(isAdmin, searchParams?.month);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-center md:text-start">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">מפגשים</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {pageData.showAdminActions
            ? "מפגשים לפי חודש — תצוגת מנהל"
            : "המפגשים שלי לפי חודש"}
        </p>
      </header>

      <SessionsMonthFilter monthParam={pageData.monthParam} monthLabel={pageData.monthLabel} />

      <SessionsMonthSummaryPanel
        summary={pageData.summary}
        showFinancials={pageData.showAdminActions}
        monthLabel={pageData.monthLabel}
      />

      {pageData.sessions.length === 0 ? (
        <SessionsEmptyState message="לא נמצאו מפגשים בחודש שנבחר" />
      ) : (
        <SessionsList
          sessions={pageData.sessions}
          showAdminActions={pageData.showAdminActions}
          showInstitutionColumn
          listReturnPath={buildSessionsPageUrl(pageData.monthView)}
        />
      )}
    </Container>
  );
}
