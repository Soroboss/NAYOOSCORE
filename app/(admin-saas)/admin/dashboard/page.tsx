import { StatCard } from "@/components/pme/stat-card";
import { getAdminStats } from "@/lib/admin-context";
import { Building2, Briefcase, ClipboardList, HandCoins, Users } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Dashboard Admin</h1>
        <p className="text-muted-foreground">Vue globale de la plateforme Nayooscore.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Institutions" value={String(stats.institutionsCount)} icon={Building2} />
        <StatCard title="PME" value={String(stats.companiesCount)} icon={Briefcase} />
        <StatCard title="Utilisateurs" value={String(stats.usersCount)} icon={Users} />
        <StatCard title="Programmes" value={String(stats.programsCount)} icon={ClipboardList} />
        <StatCard
          title="Demandes en attente"
          value={String(stats.pendingFundingCount)}
          icon={HandCoins}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/institutions", label: "Gérer les institutions" },
          { href: "/admin/users", label: "Gérer les utilisateurs" },
          { href: "/admin/programs", label: "Voir les programmes" },
          { href: "/admin/audit-logs", label: "Logs d'audit" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border bg-white p-5 text-sm font-medium text-[#0077B6] shadow-sm transition hover:border-[#00BFA6]/40 hover:shadow-md"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
