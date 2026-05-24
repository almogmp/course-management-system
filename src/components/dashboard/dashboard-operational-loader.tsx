import { DashboardOperationalSections } from "@/components/dashboard/dashboard-operational-sections";
import { getOperationalDashboardData } from "@/components/dashboard/get-operational-dashboard-data";
import { InlineErrorPanel } from "@/components/ui/inline-error-panel";
import { getSafeErrorMessage, logServerError } from "@/lib/errors/safe-error-message";

type DashboardOperationalLoaderProps = {
  isAdmin: boolean;
};

export async function DashboardOperationalLoader({ isAdmin }: DashboardOperationalLoaderProps) {
  try {
    const data = await getOperationalDashboardData(isAdmin);
    return <DashboardOperationalSections data={data} isAdmin={isAdmin} />;
  } catch (error) {
    logServerError("DashboardOperationalLoader", error);

    return (
      <InlineErrorPanel
        title="לא ניתן לטעון את אזור התפעול"
        message={getSafeErrorMessage(error, "לא ניתן לטעון את המפגשים התפעוליים כרגע.")}
        retryHref="/dashboard"
      />
    );
  }
}
