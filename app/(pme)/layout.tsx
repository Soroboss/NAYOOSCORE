import { redirect } from "next/navigation";
import { requireAuth } from "@/app/actions/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buildPmeNavFromModules, type PmeModuleKey } from "@/lib/business-modules";
import { getCompanyForUser } from "@/lib/company-context";
import { pmeNavGroups } from "@/lib/nav-config";
import {
  canAccessPme,
  filterNavGroups,
  resolvePmeRole,
} from "@/lib/permissions";

export default async function PmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth(canAccessPme);
  const company = await getCompanyForUser(user.id);

  if (!company?.onboarding_completed) {
    redirect("/pme/onboarding");
  }

  const effectiveRole = resolvePmeRole(user.role, company.member_role);

  const enabledKeys = company.modules
    .filter((m) => m.enabled)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => m.module_key as PmeModuleKey);

  const navGroups = filterNavGroups(
    [
      ...buildPmeNavFromModules(enabledKeys),
      ...pmeNavGroups.filter((group) => group.label === "Compte"),
    ],
    effectiveRole
  );

  return (
    <DashboardShell
      user={user}
      navGroups={navGroups}
      spaceLabel={company.name}
      spaceIcon="briefcase"
    >
      {children}
    </DashboardShell>
  );
}
