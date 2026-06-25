import { requireInstitution } from "@/app/actions/institution";
import { getAuthedServerClient } from "@/lib/insforge-server";

function relationName(value: unknown): string {
  if (!value) return "—";
  if (Array.isArray(value)) {
    const first = value[0] as { name?: string } | undefined;
    return first?.name ?? "—";
  }
  return (value as { name?: string }).name ?? "—";
}

export default async function InstitutionCohortsPage() {
  const { institution } = await requireInstitution();
  const client = await getAuthedServerClient();

  const { data: programs } = await client.database
    .from("programs")
    .select("id, name")
    .eq("institution_id", institution.id);

  const programIds = (programs ?? []).map((p) => p.id);
  let cohorts: Array<{
    id: string;
    name: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    program_name: string;
  }> = [];

  if (programIds.length > 0) {
    const { data } = await client.database
      .from("cohorts")
      .select("id, name, status, start_date, end_date, programs(name)")
      .in("program_id", programIds)
      .order("created_at", { ascending: false });

    cohorts = (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      start_date: c.start_date,
      end_date: c.end_date,
      program_name: relationName(c.programs),
    }));
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Cohortes</h1>
        <p className="text-muted-foreground">
          Groupes de PME par programme — {institution.name}
        </p>
      </div>

      {cohorts.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
          Aucune cohorte créée. Créez d&apos;abord un programme, puis des cohortes
          depuis l&apos;admin ou l&apos;étape suivante.
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-white">
          {cohorts.map((cohort) => (
            <div key={cohort.id} className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="font-medium">{cohort.name}</p>
                <p className="text-sm text-muted-foreground">{cohort.program_name}</p>
              </div>
              <div className="text-right text-sm">
                <span className="rounded-full bg-[#0077B6]/10 px-3 py-1 text-xs text-[#0077B6]">
                  {cohort.status}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cohort.start_date ?? "—"} → {cohort.end_date ?? "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
