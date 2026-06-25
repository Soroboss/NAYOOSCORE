import { requirePmeCompany } from "@/app/actions/company";
import { FundingRequestForm } from "@/components/pme/funding-request-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);
}

export default async function PmeFundingRequestPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const [{ data: institutions }, { data: requests }, { data: score }] = await Promise.all([
    client.database.from("institutions").select("id, name").eq("status", "active").order("name"),
    client.database
      .from("funding_requests")
      .select("*, institutions(name)")
      .eq("company_id", company.id)
      .order("submitted_at", { ascending: false }),
    client.database
      .from("scores")
      .select("global_score")
      .eq("company_id", company.id)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const globalScore = score?.global_score ?? 0;
  const canApply = globalScore >= 60;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Demande de financement</h1>
        <p className="text-muted-foreground">
          Soumettez votre dossier à une institution partenaire.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-muted-foreground">Votre score actuel</p>
        <p className="text-3xl font-bold text-[#00BFA6]">{globalScore}/100</p>
        {!canApply && (
          <p className="mt-2 text-sm text-amber-600">
            Score minimum recommandé : 60. Complétez votre profil et recalculez votre score.
          </p>
        )}
      </div>

      {canApply && <FundingRequestForm institutions={institutions ?? []} />}

      {(requests ?? []).length > 0 && (
        <div className="rounded-xl border bg-white divide-y">
          <div className="border-b px-4 py-3 font-medium">Historique</div>
          {(requests ?? []).map((r) => {
            const inst = r.institutions as { name: string } | { name: string }[] | null;
            const instName = Array.isArray(inst) ? inst[0]?.name : inst?.name;
            return (
              <div key={r.id} className="flex justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{formatFcfa(Number(r.amount_requested))}</p>
                  <p className="text-muted-foreground">{instName ?? "—"} · {r.purpose}</p>
                </div>
                <span className="rounded-full bg-[#0077B6]/10 px-3 py-1 text-xs text-[#0077B6]">
                  {r.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
