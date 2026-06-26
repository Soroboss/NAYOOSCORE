import { requireInstitution } from "@/app/actions/institution";
import { StatCard } from "@/components/pme/stat-card";
import { CompaniesTable } from "@/components/institution/companies-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { ScoreDistributionChart } from "@/components/dashboard/score-distribution-chart";
import { UsageMeter } from "@/components/dashboard/usage-meter";
import {
  getInstitutionCompanies,
  getInstitutionScoreDistribution,
  getInstitutionStats,
  getInstitutionUsage,
} from "@/lib/institution-context";
import { IconByName } from "@/components/icons/icon-by-name";
import type { IconName } from "@/lib/icon-names";
import { formatXof } from "@/lib/format";
import Link from "next/link";

export default async function InstitutionDashboardPage() {
  const { institution } = await requireInstitution();
  const [stats, companies, distribution, usage] = await Promise.all([
    getInstitutionStats(institution.id),
    getInstitutionCompanies(institution.id),
    getInstitutionScoreDistribution(institution.id),
    getInstitutionUsage(institution.id),
  ]);

  const topCompanies = [...companies]
    .filter((c) => c.global_score != null)
    .sort((a, b) => (b.global_score ?? 0) - (a.global_score ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge={usage.planName ?? "Sans abonnement"}
        title="Tableau de bord"
        description={`Pilotage du portefeuille PME — ${institution.name}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="PME accompagnées"
          value={String(stats.companiesCount)}
          icon="briefcase"
        />
        <StatCard
          title="Score moyen"
          value={`${stats.averageScore}/100`}
          icon="barChart3"
        />
        <StatCard
          title="Couverture score"
          value={`${stats.coveragePercent}%`}
          hint={`${stats.scoredCount}/${stats.companiesCount} scorées`}
          icon="percent"
        />
        <StatCard
          title="PME finançables"
          value={String(stats.fundableCount)}
          hint="Score ≥ 60"
          icon="target"
        />
        <StatCard
          title="Programmes actifs"
          value={String(stats.programsCount)}
          icon="clipboardList"
        />
        <StatCard
          title="Demandes en attente"
          value={String(stats.pendingFundingCount)}
          hint="À traiter"
          icon="handCoins"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#0B1D2A]">Quota du plan</h2>
            <Link
              href="/institution/billing"
              className="text-xs text-[#0077B6] hover:underline"
            >
              Détails →
            </Link>
          </div>
          {usage.planName ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Plan <strong className="text-[#0B1D2A]">{usage.planName}</strong> —{" "}
                {formatXof(usage.monthlyAmount)}/mois
              </p>
              <UsageMeter label="PME" {...usage.limits.pme} />
              <UsageMeter label="Programmes" {...usage.limits.programs} />
              <UsageMeter label="Utilisateurs" {...usage.limits.users} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun abonnement actif. Contactez l&apos;administrateur Nayooscore
              pour activer votre plan.
            </p>
          )}
        </section>

        <div className="lg:col-span-2">
          <ScoreDistributionChart
            buckets={distribution}
            totalScored={stats.scoredCount}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0B1D2A]">PME récentes</h2>
            <Link
              href="/institution/companies"
              className="text-sm text-[#0077B6] hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <CompaniesTable companies={companies.slice(0, 5)} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0B1D2A]">Meilleurs scores</h2>
            <Link
              href="/institution/scoring"
              className="text-sm text-[#0077B6] hover:underline"
            >
              Classement complet
            </Link>
          </div>
          <div className="rounded-xl border bg-white shadow-sm">
            {topCompanies.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Aucun score calculé pour le moment.
              </p>
            ) : (
              <div className="divide-y">
                {topCompanies.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-[#00BFA6]/10 text-xs font-bold text-[#00BFA6]">
                        {i + 1}
                      </span>
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <span className="font-semibold text-[#0077B6]">
                      {c.global_score}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            { href: "/institution/funding-decisions", label: "Financement", icon: "handCoins" },
            { href: "/institution/reports", label: "Rapports", icon: "barChart3" },
            { href: "/institution/companies", label: "Entreprises", icon: "briefcase" },
          ] as { href: string; label: string; icon: IconName }[]
        ).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border bg-white p-4 text-sm font-medium text-[#0077B6] shadow-sm transition hover:border-[#00BFA6]/40"
          >
            <IconByName name={item.icon} className="size-4" />
            {item.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
