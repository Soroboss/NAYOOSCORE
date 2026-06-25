import { requirePmeCompany } from "@/app/actions/company";
import { StatCard } from "@/components/pme/stat-card";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { DollarSign, LineChart, Receipt, TrendingUp } from "lucide-react";

function formatFcfa(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function PmeDashboardPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const [{ data: sales }, { data: expenses }, { data: scores }] = await Promise.all([
    client.database.from("sales").select("amount").eq("company_id", company.id),
    client.database.from("expenses").select("amount").eq("company_id", company.id),
    client.database
      .from("scores")
      .select("global_score, status")
      .eq("company_id", company.id)
      .order("calculated_at", { ascending: false })
      .limit(1),
  ]);

  const totalSales = (sales ?? []).reduce((sum, s) => sum + Number(s.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = totalSales - totalExpenses;
  const globalScore = scores?.[0]?.global_score ?? 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de {company.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Chiffre d'affaires" value={formatFcfa(totalSales)} icon={TrendingUp} />
        <StatCard title="Dépenses" value={formatFcfa(totalExpenses)} icon={Receipt} />
        <StatCard
          title="Résultat"
          value={formatFcfa(profit)}
          hint={profit >= 0 ? "Positif" : "À surveiller"}
          icon={DollarSign}
        />
        <StatCard
          title="Score global"
          value={`${globalScore}/100`}
          hint={scores?.[0]?.status ?? "Non calculé"}
          icon={LineChart}
        />
      </div>
    </div>
  );
}
