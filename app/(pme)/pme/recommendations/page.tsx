import { requirePmeCompany } from "@/app/actions/company";
import { GenerateRecommendationsButton } from "@/components/pme/generate-recommendations-button";
import { getAuthedServerClient } from "@/lib/insforge-server";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export default async function PmeRecommendationsPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();
  const { data: recommendations } = await client.database
    .from("recommendations")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1D2A]">Recommandations</h1>
          <p className="text-muted-foreground">
            Conseils personnalisés pour améliorer votre score.
          </p>
        </div>
        <GenerateRecommendationsButton />
      </div>

      <div className="space-y-4">
        {(recommendations ?? []).length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
            Aucune recommandation. Cliquez sur le bouton pour en générer avec l&apos;IA.
          </div>
        ) : (
          (recommendations ?? []).map((rec) => (
            <div key={rec.id} className="rounded-xl border bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-[#0B1D2A]">{rec.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs ${priorityColors[rec.priority] ?? "bg-gray-100"}`}
                >
                  {rec.priority}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{rec.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
