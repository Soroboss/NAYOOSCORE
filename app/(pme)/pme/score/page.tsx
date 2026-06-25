import { requirePmeCompany } from "@/app/actions/company";
import { CalculateScoreButton } from "@/components/pme/calculate-score-button";
import { getAuthedServerClient } from "@/lib/insforge-server";

export default async function PmeScorePage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const { data: score } = await client.database
    .from("scores")
    .select("*")
    .eq("company_id", company.id)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const dimensions = [
    { label: "Gestion", value: score?.management_score ?? 0 },
    { label: "Financier", value: score?.financial_score ?? 0 },
    { label: "Croissance", value: score?.growth_score ?? 0 },
    { label: "Conformité", value: score?.compliance_score ?? 0 },
    { label: "Gouvernance", value: score?.governance_score ?? 0 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1D2A]">Mon score</h1>
          <p className="text-muted-foreground">
            Score de finançabilité de votre entreprise.
          </p>
        </div>
        <CalculateScoreButton />
      </div>

      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-sm text-muted-foreground">Score global</p>
        <p className="mt-2 text-5xl font-bold text-[#00BFA6]">
          {score?.global_score ?? 0}
          <span className="text-2xl text-muted-foreground">/100</span>
        </p>
        <p className="mt-2 text-sm text-[#0077B6]">
          {score?.status ?? "Calculez votre score pour commencer"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dimensions.map((dim) => (
          <div key={dim.label} className="rounded-xl border bg-white p-5">
            <p className="text-sm text-muted-foreground">{dim.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#0B1D2A]">{dim.value}/20</p>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-[#00BFA6]"
                style={{ width: `${Math.min(100, (dim.value / 20) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
