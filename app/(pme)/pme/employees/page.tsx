import { requirePmeCompany } from "@/app/actions/company";
import { EmployeeForm } from "@/components/pme/employee-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

export default async function PmeEmployeesPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();
  const { data: employees } = await client.database
    .from("employees")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Employés</h1>
        <p className="text-muted-foreground">Documentez votre équipe.</p>
      </div>
      <EmployeeForm />
      <div className="rounded-xl border bg-white divide-y">
        {(employees ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucun employé.</p>
        ) : (
          (employees ?? []).map((e) => (
            <div key={e.id} className="flex justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{e.full_name}</p>
                <p className="text-muted-foreground">{e.role ?? "—"}</p>
              </div>
              <span className="text-muted-foreground">{e.hire_date ?? ""}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
