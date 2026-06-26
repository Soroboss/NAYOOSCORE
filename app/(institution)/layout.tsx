import { requireInstitution } from "@/app/actions/institution";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { institutionNavGroups } from "@/lib/nav-config";
import {
  filterNavGroups,
  resolveInstitutionRole,
} from "@/lib/permissions";

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, institution } = await requireInstitution();
  const effectiveRole = resolveInstitutionRole(user.role, institution.member_role);
  const navGroups = filterNavGroups(institutionNavGroups, effectiveRole);

  return (
    <DashboardShell
      user={user}
      navGroups={navGroups}
      spaceLabel={institution.name}
      spaceIcon="building2"
    >
      {children}
    </DashboardShell>
  );
}
