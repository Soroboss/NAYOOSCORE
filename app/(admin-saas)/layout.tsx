import { requireAuth } from "@/app/actions/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavGroups } from "@/lib/nav-config";
import { canAccessAdmin, filterNavGroups } from "@/lib/permissions";

export default async function AdminSaasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth(canAccessAdmin);
  const navGroups = filterNavGroups(adminNavGroups, user.role);

  return (
    <DashboardShell
      user={user}
      navGroups={navGroups}
      spaceLabel="Admin SaaS"
      spaceIcon="shield"
    >
      {children}
    </DashboardShell>
  );
}
