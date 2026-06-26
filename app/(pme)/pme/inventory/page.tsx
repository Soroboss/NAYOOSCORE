import Link from "next/link";
import { requirePmeCompany } from "@/app/actions/company";
import { InventoryAdjustForm } from "@/components/pme/inventory-adjust-form";
import { InventoryItemForm } from "@/components/pme/inventory-item-form";
import { isModuleEnabled } from "@/lib/business-modules";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { redirect } from "next/navigation";

export default async function PmeInventoryPage() {
  const { company } = await requirePmeCompany();

  if (!isModuleEnabled(company.modules, "inventory")) {
    redirect("/pme/dashboard");
  }

  const client = await getAuthedServerClient();
  const { data: items } = await client.database
    .from("inventory_items")
    .select("*")
    .eq("company_id", company.id)
    .order("name", { ascending: true });

  const itemOptions = (items ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    quantity: Number(i.quantity),
    unit: i.unit,
  }));

  const lowStock = itemOptions.filter((i) => i.quantity <= 5);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Stocks & inventaire</h1>
        <p className="text-muted-foreground">
          Articles physiques, matières premières et produits finis.
        </p>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Stock bas :</strong>{" "}
          {lowStock.map((i) => i.name).join(", ")} — pensez à réapprovisionner.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryItemForm />
        <InventoryAdjustForm items={itemOptions} />
      </div>

      <div className="rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-medium text-[#0B1D2A]">
          Inventaire ({itemOptions.length} article{itemOptions.length > 1 ? "s" : ""})
        </div>
        <div className="divide-y">
          {itemOptions.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Aucun article — ajoutez votre premier produit en stock.
            </p>
          ) : (
            itemOptions.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <p className="font-medium">{item.name}</p>
                <p
                  className={`font-semibold ${
                    item.quantity <= 5 ? "text-amber-600" : "text-[#0B1D2A]"
                  }`}
                >
                  {item.quantity}
                  {item.unit ? ` ${item.unit}` : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Astuce : lors d&apos;une vente d&apos;article physique, enregistrez aussi une sortie
        de stock. Liaison automatique prévue prochainement —{" "}
        <Link href="/pme/sales" className="text-[#0077B6] hover:underline">
          ventes
        </Link>
        .
      </p>
    </div>
  );
}
