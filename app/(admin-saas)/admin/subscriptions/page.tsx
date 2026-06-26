import { PlanUpsertForm } from "@/components/admin/plan-upsert-form";
import { AdminPricingPlanCard } from "@/components/admin/admin-pricing-plan-card";
import { SubscriptionAssignForm } from "@/components/admin/subscription-assign-form";
import { BillingModelBanner } from "@/components/billing/billing-model-banner";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireAdmin } from "@/app/actions/admin";
import { getAdminBillingOverview } from "@/lib/admin-context";
import { formatXof } from "@/lib/format";
import { getInstitutionPlan, getPlanPrice } from "@/lib/pricing";
import {
  institutionPlanToAdminRow,
  loadAllPricingPlans,
  pmePlanToAdminRow,
} from "@/lib/pricing-store";
import {
  canManagePricingPlans,
  getPricingPlanRestrictionMessage,
} from "@/lib/permissions";

const statusLabels: Record<string, string> = {
  active: "Actif",
  cancelled: "Annulé",
  expired: "Expiré",
  trial: "Essai",
};

export default async function AdminSubscriptionsPage() {
  const user = await requireAdmin();
  const billing = await getAdminBillingOverview();
  const pricing = await loadAllPricingPlans(true);
  const canUpdatePlans = canManagePricingPlans(user.role);
  const restrictionMessage = getPricingPlanRestrictionMessage(user.role);

  const rawById = new Map(pricing.raw.map((row) => [row.id, row]));

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Facturation"
        title="Abonnements & tarification"
        description="Grille tarifaire institutionnelle, suivi des abonnements actifs et modèle économique B2B2C."
      />

      <BillingModelBanner />

      {canUpdatePlans ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B1D2A]">Créer une offre</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nouveau plan institution ou PME. Utilisez les boutons sur chaque carte pour modifier un plan existant.
            </p>
          </div>
          <PlanUpsertForm />
        </section>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {restrictionMessage}
        </div>
      )}

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
          {pricing.institution.map((plan) => {
            const rawPlan =
              rawById.get(plan.id) ?? institutionPlanToAdminRow(plan, true);
            return (
              <AdminPricingPlanCard
                key={plan.id}
                variant="institution"
                plan={plan}
                rawPlan={rawPlan}
                canUpdate={canUpdatePlans}
                restrictionMessage={restrictionMessage}
              />
            );
          })}
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
          {pricing.pme.map((plan) => {
            const rawPlan = rawById.get(plan.id) ?? pmePlanToAdminRow(plan, true);
            return (
              <AdminPricingPlanCard
                key={plan.id}
                variant="pme"
                plan={plan}
                rawPlan={rawPlan}
                canUpdate={canUpdatePlans}
                restrictionMessage={restrictionMessage}
              />
            );
          })}
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

        <SubscriptionAssignForm
          institutions={billing.institutionsWithoutPlan}
          canAssign={canUpdatePlans}
          restrictionMessage={restrictionMessage}
        />
      </div>

      <div className="rounded-xl border border-dashed bg-[#F5F7FA]/50 p-5 text-sm text-muted-foreground">
        <strong className="text-[#0B1D2A]">Prochaine étape :</strong> connexion Stripe
        Checkout pour le paiement automatique, webhooks de renouvellement et
        factures PDF. En attendant, l&apos;admin attribue manuellement les plans.
      </div>
    </div>
  );
}
