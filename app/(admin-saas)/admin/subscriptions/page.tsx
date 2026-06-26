import { PlanUpsertForm } from "@/components/admin/plan-upsert-form";
import { SubscriptionAssignForm } from "@/components/admin/subscription-assign-form";
import { BillingModelBanner } from "@/components/billing/billing-model-banner";
import {
  InstitutionPlanCard,
  PmePlanCard,
} from "@/components/billing/pricing-plan-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminBillingOverview } from "@/lib/admin-context";
import { formatXof } from "@/lib/format";
import { getInstitutionPlan, getPlanPrice } from "@/lib/pricing";
import { loadAllPricingPlans } from "@/lib/pricing-store";

const statusLabels: Record<string, string> = {
  active: "Actif",
  cancelled: "Annulé",
  expired: "Expiré",
  trial: "Essai",
};

export default async function AdminSubscriptionsPage() {
  const billing = await getAdminBillingOverview();
  const pricing = await loadAllPricingPlans(true);

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Facturation"
        title="Abonnements & tarification"
        description="Grille tarifaire institutionnelle, suivi des abonnements actifs et modèle économique B2B2C."
      />

      <BillingModelBanner />

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1D2A]">
            Créer ou modifier une offre
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Les plans actifs sont affichés sur la landing et le parcours d&apos;inscription.
          </p>
        </div>
        <PlanUpsertForm />
        {pricing.raw.length > 0 && (
          <div className="space-y-3">
            {pricing.raw.map((plan) => (
              <details
                key={plan.id}
                className="rounded-xl border bg-white"
              >
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[#0B1D2A]">
                  Modifier : {plan.name}{" "}
                  <span className="text-muted-foreground">
                    ({plan.category}) — {plan.active ? "actif" : "inactif"}
                  </span>
                </summary>
                <div className="border-t p-4">
                  <PlanUpsertForm plan={plan} />
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">MRR total</p>
          <p className="mt-2 text-2xl font-bold text-[#0B1D2A]">
            {formatXof(billing.totalMrr)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Abonnements actifs</p>
          <p className="mt-2 text-2xl font-bold text-[#00BFA6]">
            {billing.subscriptions.filter((s) => s.status === "active").length}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Sans abonnement</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {billing.institutionsWithoutPlan.length}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0B1D2A]">
          Grille institutionnelle
        </h2>
        <p className="text-sm text-muted-foreground">
          Les institutions sont facturées selon le volume de PME et de programmes.
          Intégration Stripe prévue pour le paiement en ligne.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {pricing.institution.map((plan) => (
            <InstitutionPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0B1D2A]">
          Offres PME (inscription directe)
        </h2>
        <p className="text-sm text-muted-foreground">
          Les PME rattachées à une institution ne paient pas. Ces offres concernent
          uniquement les entrepreneurs sans partenaire institutionnel.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {pricing.pme.map((plan) => (
            <PmePlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-[#0B1D2A]">
            Abonnements en cours
          </h2>
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F7FA] text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Depuis</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {billing.subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun abonnement — attribuez un plan à une institution.
                    </td>
                  </tr>
                ) : (
                  billing.subscriptions.map((sub) => {
                    const plan = getInstitutionPlan(sub.plan_name);
                    const amount = sub.amount ?? getPlanPrice(sub.plan_name);
                    return (
                      <tr key={sub.id}>
                        <td className="px-4 py-3 font-medium">{sub.institution_name}</td>
                        <td className="px-4 py-3">{plan?.name ?? sub.plan_name}</td>
                        <td className="px-4 py-3">{formatXof(amount)}/mois</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#00BFA6]/10 px-2 py-1 text-xs text-[#00BFA6]">
                            {statusLabels[sub.status] ?? sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(sub.started_at).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <SubscriptionAssignForm institutions={billing.institutionsWithoutPlan} />
      </div>

      <div className="rounded-xl border border-dashed bg-[#F5F7FA]/50 p-5 text-sm text-muted-foreground">
        <strong className="text-[#0B1D2A]">Prochaine étape :</strong> connexion Stripe
        Checkout pour le paiement automatique, webhooks de renouvellement et
        factures PDF. En attendant, l&apos;admin attribue manuellement les plans.
      </div>
    </div>
  );
}
