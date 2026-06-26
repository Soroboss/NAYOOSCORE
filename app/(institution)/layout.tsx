import { requireInstitution } from "@/app/actions/institution";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { institutionNavGroups } from "@/lib/nav-config";

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, institution } = await requireInstitution();

  return (
    <DashboardShell
      user={user}
      navGroups={institutionNavGroups}
      spaceLabel={institution.name}
      spaceIcon="building2"
    >
      {children}
    </DashboardShell>
  );
}
