import { requirePmeCompany } from "@/app/actions/company";
import { CustomerForm } from "@/components/pme/customer-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

export default async function PmeCustomersPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();
  const { data: customers } = await client.database
    .from("customers")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Clients</h1>
        <p className="text-muted-foreground">Gérez votre portefeuille clients.</p>
      </div>
      <CustomerForm />
      <div className="rounded-xl border bg-white divide-y">
        {(customers ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucun client.</p>
        ) : (
          (customers ?? []).map((c) => (
            <div key={c.id} className="flex justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground">{c.email ?? c.phone ?? "—"}</p>
              </div>
              {c.is_recurring && (
                <span className="rounded-full bg-[#00BFA6]/10 px-2 py-1 text-xs text-[#00BFA6]">
                  Récurrent
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
