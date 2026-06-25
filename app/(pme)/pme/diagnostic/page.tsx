import { requirePmeCompany } from "@/app/actions/company";
import { DiagnosticForm } from "@/components/forms/diagnostic-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

export default async function PmeDiagnosticPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const { data: diagnostic } = await client.database
    .from("diagnostics")
    .select("responses")
    .eq("company_id", company.id)
    .maybeSingle();

  const responses = (diagnostic?.responses ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Diagnostic</h1>
        <p className="text-muted-foreground">
          Évaluez la maturité de votre entreprise pour affiner votre score.
        </p>
      </div>
      <DiagnosticForm initial={responses as Parameters<typeof DiagnosticForm>[0]["initial"]} />
    </div>
  );
}
