import { requirePmeCompany } from "@/app/actions/company";
import { SupplierForm } from "@/components/pme/supplier-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

export default async function PmeSuppliersPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();
  const { data: suppliers } = await client.database
    .from("suppliers")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Fournisseurs</h1>
        <p className="text-muted-foreground">Suivez vos partenaires et fournisseurs.</p>
      </div>
      <SupplierForm />
      <div className="rounded-xl border bg-white divide-y">
        {(suppliers ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucun fournisseur.</p>
        ) : (
          (suppliers ?? []).map((s) => (
            <div key={s.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{s.name}</p>
              <p className="text-muted-foreground">{s.email ?? s.phone ?? "—"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
