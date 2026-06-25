import { requirePmeCompany } from "@/app/actions/company";
import { SaleForm } from "@/components/pme/sale-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

function formatFcfa(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function PmeSalesPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const { data: sales } = await client.database
    .from("sales")
    .select("*")
    .eq("company_id", company.id)
    .order("sale_date", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Ventes</h1>
        <p className="text-muted-foreground">Saisie et suivi de vos ventes.</p>
      </div>

      <SaleForm />

      <div className="rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-medium text-[#0B1D2A]">
          Dernières ventes
        </div>
        <div className="divide-y">
          {(sales ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Aucune vente enregistrée.</p>
          ) : (
            (sales ?? []).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{sale.customer_name ?? "Client"}</p>
                  <p className="text-muted-foreground">{sale.sale_date}</p>
                </div>
                <p className="font-semibold text-[#00BFA6]">
                  {formatFcfa(Number(sale.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
