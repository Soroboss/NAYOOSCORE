import { requirePmeCompany } from "@/app/actions/company";
import { MarketingActionForm } from "@/components/pme/marketing-action-form";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { formatXof } from "@/lib/format";
import { labelFor, ACTION_STATUSES, MARKETING_CHANNELS } from "@/lib/pme-catalog";

export default async function PmeMarketingPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();

  const { data: actions } = await client.database
    .from("marketing_actions")
    .select("*")
    .eq("company_id", company.id)
    .order("start_date", { ascending: false })
    .limit(25);

  const totalSpent = (actions ?? []).reduce((s, a) => s + Number(a.spent_amount ?? 0), 0);
  const totalBudget = (actions ?? []).reduce((s, a) => s + Number(a.budget_amount ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Actions marketing</h1>
        <p className="text-muted-foreground">
          Campagnes, publicité et promotions — budget et dépenses suivis.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Budget total campagnes</p>
          <p className="text-2xl font-bold text-[#0B1D2A]">{formatXof(totalBudget)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Dépensé</p>
          <p className="text-2xl font-bold text-[#00BFA6]">{formatXof(totalSpent)}</p>
        </div>
      </div>

      <MarketingActionForm />

      <div className="rounded-xl border bg-white divide-y">
        {(actions ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucune action marketing.</p>
        ) : (
          (actions ?? []).map((a) => (
            <div key={a.id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-muted-foreground">
                  {labelFor(MARKETING_CHANNELS, a.channel)} ·{" "}
                  {labelFor(ACTION_STATUSES, a.status)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.start_date}
                  {a.end_date ? ` → ${a.end_date}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0077B6]">
                  {formatXof(Number(a.spent_amount ?? 0))}
                </p>
                <p className="text-xs text-muted-foreground">
                  / {formatXof(Number(a.budget_amount ?? 0))}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
