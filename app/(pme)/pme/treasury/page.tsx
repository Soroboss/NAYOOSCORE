import { requirePmeCompany } from "@/app/actions/company";
import { TreasuryForm } from "@/components/pme/treasury-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);
}

export default async function PmeTreasuryPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();
  const { data: entries } = await client.database
    .from("treasury_entries")
    .select("*")
    .eq("company_id", company.id)
    .order("entry_date", { ascending: false })
    .limit(30);

  const inflows = (entries ?? []).filter((e) => e.type === "inflow").reduce((s, e) => s + Number(e.amount), 0);
  const outflows = (entries ?? []).filter((e) => e.type === "outflow").reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Trésorerie</h1>
        <p className="text-muted-foreground">Suivi des entrées et sorties de cash.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Entrées</p>
          <p className="text-xl font-bold text-[#00BFA6]">{formatFcfa(inflows)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Sorties</p>
          <p className="text-xl font-bold text-[#0077B6]">{formatFcfa(outflows)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Solde</p>
          <p className="text-xl font-bold">{formatFcfa(inflows - outflows)}</p>
        </div>
      </div>
      <TreasuryForm />
      <div className="rounded-xl border bg-white divide-y">
        {(entries ?? []).map((e) => (
          <div key={e.id} className="flex justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{e.description ?? (e.type === "inflow" ? "Entrée" : "Sortie")}</p>
              <p className="text-muted-foreground">{e.entry_date}</p>
            </div>
            <p className={e.type === "inflow" ? "text-[#00BFA6] font-semibold" : "text-[#0077B6] font-semibold"}>
              {e.type === "inflow" ? "+" : "-"}{formatFcfa(Number(e.amount))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
