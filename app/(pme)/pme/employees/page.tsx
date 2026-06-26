import { requirePmeCompany } from "@/app/actions/company";
import { EmployeeForm } from "@/components/pme/employee-form";
import { EmployeeBonusForm } from "@/components/pme/employee-bonus-form";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { formatXof } from "@/lib/format";
import { labelFor, BONUS_TYPES } from "@/lib/pme-catalog";

export default async function PmeEmployeesPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const [{ data: employees }, { data: bonuses }] = await Promise.all([
    client.database
      .from("employees")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false }),
    client.database
      .from("employee_bonuses")
      .select("*, employees(full_name)")
      .eq("company_id", company.id)
      .order("bonus_date", { ascending: false })
      .limit(20),
  ]);

  const employeeOptions = (employees ?? []).map((e) => ({
    id: e.id,
    full_name: e.full_name,
  }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Employés & primes</h1>
        <p className="text-muted-foreground">
          Équipe, salaires et primes — synchronisés avec vos dépenses.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EmployeeForm />
        <EmployeeBonusForm employees={employeeOptions} />
      </div>

      <div className="rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-medium text-[#0B1D2A]">Équipe</div>
        <div className="divide-y">
          {(employees ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Aucun employé.</p>
          ) : (
            (employees ?? []).map((e) => (
              <div key={e.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{e.full_name}</p>
                  <p className="text-muted-foreground">{e.role ?? "—"}</p>
                </div>
                <div className="text-right">
                  {e.monthly_salary != null && (
                    <p className="font-medium text-[#0B1D2A]">
                      {formatXof(Number(e.monthly_salary))}/mois
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{e.hire_date ?? ""}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(bonuses ?? []).length > 0 && (
        <div className="rounded-xl border bg-white">
          <div className="border-b px-4 py-3 font-medium text-[#0B1D2A]">
            Dernières primes
          </div>
          <div className="divide-y">
            {(bonuses ?? []).map((b) => {
              const empName = Array.isArray(b.employees)
                ? b.employees[0]?.full_name
                : b.employees?.full_name;
              return (
                <div key={b.id} className="flex justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{empName ?? "Employé"}</p>
                    <p className="text-muted-foreground">
                      {labelFor(BONUS_TYPES, b.bonus_type)} · {b.bonus_date}
                    </p>
                  </div>
                  <p className="font-semibold text-[#0077B6]">
                    {formatXof(Number(b.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
