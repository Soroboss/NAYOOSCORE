import { requireInstitution } from "@/app/actions/institution";
import {
  getInstitutionCompanies,
  getInstitutionPrograms,
  getInstitutionStats,
} from "@/lib/institution-context";

export default async function InstitutionReportsPage() {
  const { institution } = await requireInstitution();
  const [stats, companies, programs] = await Promise.all([
    getInstitutionStats(institution.id),
    getInstitutionCompanies(institution.id),
    getInstitutionPrograms(institution.id),
  ]);

  const scored = companies.filter((c) => c.global_score != null);
  const readyForFunding = scored.filter((c) => (c.global_score ?? 0) >= 60);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Rapports</h1>
        <p className="text-muted-foreground">
          Synthèse d&apos;activité — {institution.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Taux de couverture score</p>
          <p className="mt-2 text-2xl font-bold text-[#0B1D2A]">
            {companies.length > 0
              ? `${Math.round((scored.length / companies.length) * 100)}%`
              : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {scored.length}/{companies.length} PME scorées
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">PME finançables (≥60)</p>
          <p className="mt-2 text-2xl font-bold text-[#00BFA6]">
            {readyForFunding.length}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Programmes actifs</p>
          <p className="mt-2 text-2xl font-bold text-[#0077B6]">
            {stats.programsCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {programs.length} au total
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
        Export PDF / Excel — disponible à l&apos;étape suivante.
      </div>
    </div>
  );
}
