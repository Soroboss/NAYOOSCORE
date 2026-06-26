import { StatCard } from "@/components/pme/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { BillingModelBanner } from "@/components/billing/billing-model-banner";
import { getAdminBillingOverview, getAdminStats } from "@/lib/admin-context";
import { formatXof } from "@/lib/format";
import { getInstitutionPlan } from "@/lib/pricing";
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  CreditCard,
  HandCoins,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [stats, billing] = await Promise.all([
    getAdminStats(),
    getAdminBillingOverview(),
  ]);

  const scoreCoverage =
    stats.companiesCount > 0
      ? Math.round((stats.scoredCompaniesCount / stats.companiesCount) * 100)
      : 0;

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Admin SaaS"
        title="Vue plateforme"
        description="Indicateurs clés, revenus récurrents et santé du portefeuille PME."
      />

      <BillingModelBanner />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Revenus & abonnements
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="MRR"
            value={formatXof(stats.mrr)}
            hint="Revenu mensuel récurrent"
            icon={TrendingUp}
          />
          <StatCard
            title="Abonnements actifs"
            value={String(stats.activeSubscriptionsCount)}
            hint={`${billing.institutionsWithoutPlan.length} sans plan`}
            icon={CreditCard}
          />
          <StatCard
            title="Institutions"
            value={String(stats.institutionsCount)}
            icon={Building2}
          />
          <StatCard
            title="Programmes"
            value={String(stats.programsCount)}
            icon={ClipboardList}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Portefeuille & impact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="PME" value={String(stats.companiesCount)} icon={Briefcase} />
          <StatCard title="Utilisateurs" value={String(stats.usersCount)} icon={Users} />
          <StatCard
            title="Score moyen"
            value={`${stats.averagePlatformScore}/100`}
            hint={`${stats.scoredCompaniesCount} PME scorées`}
            icon={BarChart3}
          />
          <StatCard
            title="Couverture scoring"
            value={`${scoreCoverage}%`}
            hint="PME avec score calculé"
            icon={BarChart3}
          />
          <StatCard
            title="Demandes financement"
            value={String(stats.pendingFundingCount)}
            hint="En attente de traitement"
            icon={HandCoins}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-[#0B1D2A]">Répartition par plan</h3>
          {billing.planDistribution.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucun abonnement actif —{" "}
              <Link href="/admin/subscriptions" className="text-[#0077B6] hover:underline">
                attribuer un plan
              </Link>
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {billing.planDistribution.map((row) => {
                const plan = getInstitutionPlan(row.planId);
                return (
                  <div
                    key={row.planId}
                    className="flex items-center justify-between rounded-lg bg-[#F5F7FA] px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{plan?.name ?? row.planId}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.count} institution{row.count > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="font-semibold text-[#0077B6]">
                      {formatXof(row.mrr)}/mois
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {[
            { href: "/admin/institutions", label: "Institutions", desc: "Créer et gérer" },
            { href: "/admin/subscriptions", label: "Abonnements", desc: "Plans et facturation" },
            { href: "/admin/users", label: "Utilisateurs", desc: "Profils plateforme" },
            { href: "/admin/audit-logs", label: "Audit", desc: "Traçabilité" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-[#00BFA6]/40 hover:shadow-md"
            >
              <p className="font-medium text-[#0077B6]">{link.label} →</p>
              <p className="mt-1 text-xs text-muted-foreground">{link.desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
