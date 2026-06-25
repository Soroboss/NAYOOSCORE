import { Building2 } from "lucide-react";
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
      spaceIcon={<Building2 className="size-4 text-[#00BFA6]" />}
    >
      {children}
    </DashboardShell>
  );
}
