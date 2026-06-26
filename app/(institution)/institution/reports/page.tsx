import Link from "next/link";
import { requireInstitution } from "@/app/actions/institution";
import { PageHeader } from "@/components/dashboard/page-header";
import { ScoreDistributionChart } from "@/components/dashboard/score-distribution-chart";
import {
  getInstitutionCompanies,
  getInstitutionPrograms,
  getInstitutionScoreDistribution,
  getInstitutionStats,
} from "@/lib/institution-context";
import { SCORE_THRESHOLDS } from "@/lib/constants";

export default async function InstitutionReportsPage() {
  const { institution } = await requireInstitution();
  const [stats, companies, programs, distribution] = await Promise.all([
    getInstitutionStats(institution.id),
    getInstitutionCompanies(institution.id),
    getInstitutionPrograms(institution.id),
    getInstitutionScoreDistribution(institution.id),
  ]);

  const scored = companies.filter((c) => c.global_score != null);
  const readyForFunding = scored.filter(
    (c) => (c.global_score ?? 0) >= SCORE_THRESHOLDS.IN_PROGRESS.min
  );
  const preFundable = scored.filter(
    (c) => (c.global_score ?? 0) >= SCORE_THRESHOLDS.PRE_FUNDABLE.min
  );

  const metrics = [
    {
      label: "Taux de couverture score",
      value:
        companies.length > 0
          ? `${Math.round((scored.length / companies.length) * 100)}%`
          : "—",
      detail: `${scored.length}/${companies.length} PME scorées`,
    },
    {
      label: "Score moyen portefeuille",
      value: `${stats.averageScore}/100`,
      detail: "Dernier score par PME",
    },
    {
      label: "PME en progression (≥60)",
      value: String(readyForFunding.length),
      detail: "Éligibles au financement",
    },
    {
      label: "PME pré-finançables (≥75)",
      value: String(preFundable.length),
      detail: "Profil solide",
    },
    {
      label: "Programmes actifs",
      value: String(stats.programsCount),
      detail: `${programs.length} au total`,
    },
    {
      label: "Demandes en attente",
      value: String(stats.pendingFundingCount),
      detail: "À traiter",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Mesure d'impact"
        title="Rapports & indicateurs"
        description={`Comment mesurer l'efficacité de votre accompagnement — ${institution.name}`}
      />

      <div className="rounded-xl border border-[#0077B6]/20 bg-[#0077B6]/5 p-5 text-sm text-[#0B1D2A]/85">
        <strong>Comment lire ces indicateurs ?</strong> La couverture score mesure
        combien de PME ont un diagnostic à jour. Le score moyen reflète la santé
        globale du portefeuille. Les seuils 60 et 75 correspondent aux paliers
        d&apos;éligibilité au financement sur Nayooscore.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{m.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#0B1D2A]">{m.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.detail}</p>
          </div>
        ))}
      </div>

      <ScoreDistributionChart
        buckets={distribution}
        totalScored={stats.scoredCount}
      />

      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-white p-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-medium text-[#0B1D2A]">Exporter le portefeuille</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Téléchargez la liste des PME avec score et programme (CSV).
          </p>
        </div>
        <Link
          href="/api/institution/reports/export"
          className="inline-flex items-center rounded-lg bg-[#0077B6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#006299]"
        >
          Télécharger CSV
        </Link>
      </div>
    </div>
  );
}
