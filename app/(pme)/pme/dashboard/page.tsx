import Link from "next/link";
import { requirePmeCompany } from "@/app/actions/company";
import { StatCard } from "@/components/pme/stat-card";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { formatXof } from "@/lib/format";
import { labelFor, SALE_TYPES } from "@/lib/pme-catalog";
import {
  Briefcase,
  LineChart,
  Megaphone,
  MapPin,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default async function PmeDashboardPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const [
    { data: sales },
    { data: expenses },
    { data: scores },
    { data: recentSales },
    { data: recentExpenses },
    { data: employees },
  ] = await Promise.all([
    client.database.from("sales").select("amount").eq("company_id", company.id),
    client.database.from("expenses").select("amount").eq("company_id", company.id),
    client.database
      .from("scores")
      .select("global_score, status")
      .eq("company_id", company.id)
      .order("calculated_at", { ascending: false })
      .limit(1),
    client.database
      .from("sales")
      .select("amount, customer_name, sale_date, sale_type, item_name")
      .eq("company_id", company.id)
      .order("sale_date", { ascending: false })
      .limit(5),
    client.database
      .from("expenses")
      .select("amount, category, description, expense_date")
      .eq("company_id", company.id)
      .order("expense_date", { ascending: false })
      .limit(5),
    client.database.from("employees").select("id").eq("company_id", company.id),
  ]);

  let marketing: { spent_amount: number }[] = [];
  let fieldActions: { revenue_generated: number }[] = [];
  try {
    const { data } = await client.database
      .from("marketing_actions")
      .select("spent_amount")
      .eq("company_id", company.id);
    marketing = data ?? [];
  } catch {
    marketing = [];
  }
  try {
    const { data } = await client.database
      .from("field_actions")
      .select("revenue_generated")
      .eq("company_id", company.id);
    fieldActions = data ?? [];
  } catch {
    fieldActions = [];
  }

  const totalSales = (sales ?? []).reduce((sum, s) => sum + Number(s.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = totalSales - totalExpenses;
  const globalScore = scores?.[0]?.global_score ?? 0;
  const marketingTotal = (marketing ?? []).reduce(
    (s, m) => s + Number(m.spent_amount ?? 0),
    0
  );
  const fieldTotal = (fieldActions ?? []).reduce(
    (s, f) => s + Number(f.revenue_generated ?? 0),
    0
  );

  const quickLinks = [
    { href: "/pme/sales", label: "Ventes", icon: TrendingUp },
    { href: "/pme/expenses", label: "Dépenses", icon: Receipt },
    { href: "/pme/employees", label: "Équipe", icon: Briefcase },
    { href: "/pme/marketing", label: "Marketing", icon: Megaphone },
    { href: "/pme/field-ops", label: "Terrain", icon: MapPin },
    { href: "/pme/score", label: "Mon score", icon: LineChart },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Dashboard</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de {company.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Chiffre d'affaires" value={formatXof(totalSales)} icon={TrendingUp} />
        <StatCard title="Dépenses" value={formatXof(totalExpenses)} icon={Receipt} />
        <StatCard
          title="Résultat"
          value={formatXof(profit)}
          hint={profit >= 0 ? "Positif" : "À surveiller"}
          icon={Wallet}
        />
        <StatCard
          title="Score global"
          value={`${globalScore}/100`}
          hint={scores?.[0]?.status ?? "Non calculé"}
          icon={LineChart}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Employés"
          value={String((employees ?? []).length)}
          icon={Briefcase}
        />
        <StatCard
          title="Marketing dépensé"
          value={formatXof(marketingTotal)}
          icon={Megaphone}
        />
        <StatCard
          title="Ventes terrain"
          value={formatXof(fieldTotal)}
          icon={MapPin}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold text-[#0B1D2A]">Dernières ventes</h2>
            <Link href="/pme/sales" className="text-xs text-[#0077B6] hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y">
            {(recentSales ?? []).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Aucune vente.</p>
            ) : (
              (recentSales ?? []).map((sale) => (
                <div key={`${sale.sale_date}-${sale.customer_name}`} className="flex justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{sale.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {labelFor(SALE_TYPES, sale.sale_type)}
                      {sale.item_name ? ` · ${sale.item_name}` : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-[#00BFA6]">
                    {formatXof(Number(sale.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold text-[#0B1D2A]">Dernières dépenses</h2>
            <Link href="/pme/expenses" className="text-xs text-[#0077B6] hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="divide-y">
            {(recentExpenses ?? []).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Aucune dépense.</p>
            ) : (
              (recentExpenses ?? []).map((exp) => (
                <div key={`${exp.expense_date}-${exp.description}`} className="flex justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{exp.category}</p>
                    <p className="text-xs text-muted-foreground">{exp.description}</p>
                  </div>
                  <span className="font-semibold text-[#0077B6]">
                    {formatXof(Number(exp.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 rounded-xl border bg-white p-3 text-sm font-medium text-[#0077B6] shadow-sm transition hover:border-[#00BFA6]/40"
          >
            <link.icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
