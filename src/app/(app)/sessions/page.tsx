import { getSessions } from "@/components/sessions/get-sessions";
import { SessionsEmptyState } from "@/components/sessions/sessions-empty-state";
import { SessionsList } from "@/components/sessions/sessions-list";
import { Container } from "@/components/ui/container";
import { requireAuth } from "@/lib/auth/guards";

export default async function SessionsPage() {
  await requireAuth();

  const sessions = await getSessions();

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">מפגשים</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {sessions.length > 0
            ? `${sessions.length} מפגשים במערכת`
            : "רשימת המפגשים במערכת"}
        </p>
      </header>

      {sessions.length === 0 ? (
        <SessionsEmptyState />
      ) : (
        <SessionsList sessions={sessions} />
      )}
    </Container>
  );
}
