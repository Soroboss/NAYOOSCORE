import { Shield } from "lucide-react";
import { requireAuth } from "@/app/actions/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavGroups } from "@/lib/nav-config";
import { canAccessAdmin } from "@/lib/permissions";

export default async function AdminSaasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth(canAccessAdmin);

  return (
    <DashboardShell
      user={user}
      navGroups={adminNavGroups}
      spaceLabel="Admin SaaS"
      spaceIcon={<Shield className="size-4 text-[#00BFA6]" />}
    >
      {children}
    </DashboardShell>
  );
}
