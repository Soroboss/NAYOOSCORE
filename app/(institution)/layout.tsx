import { Building2 } from "lucide-react";
import { requireAuth } from "@/app/actions/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { institutionNavGroups } from "@/lib/nav-config";
import { canAccessInstitution } from "@/lib/permissions";

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth(canAccessInstitution);

  return (
    <DashboardShell
      user={user}
      navGroups={institutionNavGroups}
      spaceLabel="Espace Institution"
      spaceIcon={<Building2 className="size-4 text-[#00BFA6]" />}
    >
      {children}
    </DashboardShell>
  );
}
