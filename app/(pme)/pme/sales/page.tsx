import { requirePmeCompany } from "@/app/actions/company";
import { SaleForm } from "@/components/pme/sale-form";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { formatXof } from "@/lib/format";
import { labelFor, PAYMENT_METHODS, SALE_TYPES } from "@/lib/pme-catalog";

export default async function PmeSalesPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const { data: sales } = await client.database
    .from("sales")
    .select("*")
    .eq("company_id", company.id)
    .order("sale_date", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Ventes & recettes</h1>
        <p className="text-muted-foreground">
          Articles physiques, prestations, abonnements — toutes vos entrées d&apos;argent.
        </p>
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
              <div key={sale.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{sale.customer_name ?? "Client"}</p>
                  <p className="text-muted-foreground">
                    {labelFor(SALE_TYPES, sale.sale_type)}
                    {sale.item_name ? ` · ${sale.item_name}` : ""}
                    {sale.quantity && Number(sale.quantity) !== 1
                      ? ` · ${sale.quantity}${sale.unit ? ` ${sale.unit}` : ""}`
                      : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.sale_date}
                    {sale.payment_method
                      ? ` · ${labelFor(PAYMENT_METHODS, sale.payment_method)}`
                      : ""}
                  </p>
                </div>
                <p className="font-semibold text-[#00BFA6]">
                  {formatXof(Number(sale.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
