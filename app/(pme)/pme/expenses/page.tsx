import { requirePmeCompany } from "@/app/actions/company";
import { ExpenseForm } from "@/components/pme/expense-form";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { formatXof } from "@/lib/format";

export default async function PmeExpensesPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const { data: expenses } = await client.database
    .from("expenses")
    .select("*")
    .eq("company_id", company.id)
    .order("expense_date", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Dépenses & sorties</h1>
        <p className="text-muted-foreground">
          Salaires, primes, marketing, terrain, achats — toutes vos charges.
        </p>
      </div>

      <ExpenseForm />

      <div className="rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-medium text-[#0B1D2A]">
          Dernières dépenses
        </div>
        <div className="divide-y">
          {(expenses ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Aucune dépense enregistrée.</p>
          ) : (
            (expenses ?? []).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{expense.category ?? "Dépense"}</p>
                  <p className="text-muted-foreground">
                    {expense.description} · {expense.expense_date}
                  </p>
                </div>
                <p className="font-semibold text-[#0077B6]">
                  {formatXof(Number(expense.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
