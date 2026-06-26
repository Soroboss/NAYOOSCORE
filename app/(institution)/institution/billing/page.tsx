import { requireInstitution } from "@/app/actions/institution";
import { PageHeader } from "@/components/dashboard/page-header";
import { UsageMeter } from "@/components/dashboard/usage-meter";
import { InstitutionPlanCard } from "@/components/billing/pricing-plan-card";
import {
  getInstitutionStats,
  getInstitutionUsage,
} from "@/lib/institution-context";
import { formatXof } from "@/lib/format";
import { INSTITUTION_PLANS, getInstitutionPlan } from "@/lib/pricing";
import { CONTACT } from "@/lib/constants";
import { CheckCircle2, CreditCard } from "lucide-react";

export default async function InstitutionBillingPage() {
  const { institution } = await requireInstitution();
  const [usage, stats] = await Promise.all([
    getInstitutionUsage(institution.id),
    getInstitutionStats(institution.id),
  ]);

  const currentPlan = usage.planId ? getInstitutionPlan(usage.planId) : null;

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Facturation"
        title="Abonnement & quotas"
        description="Votre institution est le client SaaS. Les PME que vous accompagnez sont incluses dans votre plan."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="size-5 text-[#0077B6]" />
            <h2 className="text-lg font-semibold text-[#0B1D2A]">Plan actuel</h2>
          </div>

          {usage.subscription && currentPlan ? (
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-[#0B1D2A]">{currentPlan.name}</p>
                <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
              </div>
              <p className="text-xl font-semibold text-[#00BFA6]">
                {formatXof(usage.monthlyAmount)}
                <span className="text-sm font-normal text-muted-foreground"> / mois</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Actif depuis le{" "}
                {new Date(usage.subscription.started_at).toLocaleDateString("fr-FR")}
              </p>
              <ul className="space-y-2 border-t pt-4">
                {currentPlan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#00BFA6]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Aucun abonnement actif pour {institution.name}.
              </p>
              <p className="text-sm">
                Contactez Nayooscore pour souscrire à un plan et débloquer
                l&apos;accompagnement de votre portefeuille PME.
              </p>
              <a
                href={CONTACT.whatsappHref}
                className="inline-flex text-sm font-medium text-[#0077B6] hover:underline"
              >
                Nous contacter sur WhatsApp →
              </a>
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#0B1D2A]">
            Consommation actuelle
          </h2>
          <div className="space-y-5">
            <UsageMeter label="PME accompagnées" {...usage.limits.pme} />
            <UsageMeter label="Programmes actifs" {...usage.limits.programs} />
            <UsageMeter label="Membres équipe" {...usage.limits.users} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg bg-[#F5F7FA] p-4 text-center text-sm">
            <div>
              <p className="text-2xl font-bold text-[#0B1D2A]">{stats.coveragePercent}%</p>
              <p className="text-xs text-muted-foreground">Couverture score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#00BFA6]">{stats.fundableCount}</p>
              <p className="text-xs text-muted-foreground">PME finançables</p>
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0B1D2A]">Comparer les plans</h2>
        <p className="text-sm text-muted-foreground">
          Pour changer de plan ou passer à une offre supérieure, contactez votre
          gestionnaire de compte Nayooscore.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {INSTITUTION_PLANS.map((plan) => (
            <InstitutionPlanCard
              key={plan.id}
              plan={plan}
              compact={plan.id !== usage.planId}
            />
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-dashed bg-[#F5F7FA]/50 p-5 text-sm text-muted-foreground">
        <strong className="text-[#0B1D2A]">PME incluses :</strong> vos entrepreneurs
        accompagnés n&apos;ont rien à payer. Le coût est porté par votre institution
        selon le volume de PME et de programmes actifs.
      </div>
    </div>
  );
}
