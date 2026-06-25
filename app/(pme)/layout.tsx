import { Briefcase } from "lucide-react";
import { requireAuth } from "@/app/actions/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { pmeNavGroups } from "@/lib/nav-config";
import { canAccessPme } from "@/lib/permissions";

export default async function PmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth(canAccessPme);

  return (
    <DashboardShell
      user={user}
      navGroups={pmeNavGroups}
      spaceLabel="Espace PME"
      spaceIcon={<Briefcase className="size-4 text-[#00BFA6]" />}
    >
      {children}
    </DashboardShell>
  );
}
