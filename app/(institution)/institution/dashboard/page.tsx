import { requireInstitution } from "@/app/actions/institution";
import { StatCard } from "@/components/pme/stat-card";
import { CompaniesTable } from "@/components/institution/companies-table";
import {
  getInstitutionCompanies,
  getInstitutionStats,
} from "@/lib/institution-context";
import { BarChart3, Briefcase, ClipboardList, HandCoins } from "lucide-react";
import Link from "next/link";

export default async function InstitutionDashboardPage() {
  const { institution } = await requireInstitution();
  const [stats, companies] = await Promise.all([
    getInstitutionStats(institution.id),
    getInstitutionCompanies(institution.id),
  ]);

  const topCompanies = [...companies]
    .filter((c) => c.global_score != null)
    .sort((a, b) => (b.global_score ?? 0) - (a.global_score ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble — {institution.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="PME accompagnées"
          value={String(stats.companiesCount)}
          icon={Briefcase}
        />
        <StatCard
          title="Score moyen"
          value={`${stats.averageScore}/100`}
          icon={BarChart3}
        />
        <StatCard
          title="Programmes actifs"
          value={String(stats.programsCount)}
          icon={ClipboardList}
        />
        <StatCard
          title="Demandes en attente"
          value={String(stats.pendingFundingCount)}
          hint="À traiter"
          icon={HandCoins}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0B1D2A]">
              PME récentes
            </h2>
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
            <h2 className="text-lg font-semibold text-[#0B1D2A]">
              Meilleurs scores
            </h2>
            <Link
              href="/institution/scoring"
              className="text-sm text-[#0077B6] hover:underline"
            >
              Classement complet
            </Link>
          </div>
          <div className="rounded-xl border bg-white">
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
    </div>
  );
}
