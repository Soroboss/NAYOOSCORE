import { requireInstitution } from "@/app/actions/institution";
import { CompaniesTable } from "@/components/institution/companies-table";
import { getInstitutionScoringLeaderboard } from "@/lib/institution-context";

export default async function InstitutionScoringPage() {
  const { institution } = await requireInstitution();
  const leaderboard = await getInstitutionScoringLeaderboard(institution.id);

  const withScore = leaderboard.filter((c) => c.global_score != null);
  const withoutScore = leaderboard.filter((c) => c.global_score == null);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Analyse des scores</h1>
        <p className="text-muted-foreground">
          Classement des PME par score de finançabilité
        </p>
      </div>

      {withScore.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#0B1D2A]">
            Classement ({withScore.length} PME scorées)
          </h2>
          <CompaniesTable companies={withScore} />
        </section>
      )}

      {withoutScore.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#0B1D2A]">
            Sans score ({withoutScore.length})
          </h2>
          <CompaniesTable companies={withoutScore} />
        </section>
      )}

      {leaderboard.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
          Aucune PME rattachée à votre institution.
        </div>
      )}
    </div>
  );
}
