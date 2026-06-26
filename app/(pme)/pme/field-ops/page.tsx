import { requirePmeCompany } from "@/app/actions/company";
import { FieldActionForm } from "@/components/pme/field-action-form";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { formatXof } from "@/lib/format";
import { labelFor, FIELD_STATUSES } from "@/lib/pme-catalog";

export default async function PmeFieldOpsPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const [{ data: employees }, { data: actions }] = await Promise.all([
    client.database
      .from("employees")
      .select("id, full_name")
      .eq("company_id", company.id),
    client.database
      .from("field_actions")
      .select("*, employees(full_name)")
      .eq("company_id", company.id)
      .order("action_date", { ascending: false })
      .limit(25),
  ]);

  const totalCost = (actions ?? []).reduce((s, a) => s + Number(a.cost ?? 0), 0);
  const totalRevenue = (actions ?? []).reduce(
    (s, a) => s + Number(a.revenue_generated ?? 0),
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Actions terrain</h1>
        <p className="text-muted-foreground">
          Prospection, livraisons, chantiers — coûts et ventes sur le terrain.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Coûts terrain</p>
          <p className="text-2xl font-bold text-[#0077B6]">{formatXof(totalCost)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Ventes générées</p>
          <p className="text-2xl font-bold text-[#00BFA6]">{formatXof(totalRevenue)}</p>
        </div>
      </div>

      <FieldActionForm employees={employees ?? []} />

      <div className="rounded-xl border bg-white divide-y">
        {(actions ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucune action terrain.</p>
        ) : (
          (actions ?? []).map((a) => {
            const empName = Array.isArray(a.employees)
              ? a.employees[0]?.full_name
              : a.employees?.full_name;
            return (
              <div key={a.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-muted-foreground">
                    {a.location ?? "—"} · {labelFor(FIELD_STATUSES, a.status)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.action_date}
                    {empName ? ` · ${empName}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-[#0077B6]">-{formatXof(Number(a.cost ?? 0))}</p>
                  <p className="text-[#00BFA6]">+{formatXof(Number(a.revenue_generated ?? 0))}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
