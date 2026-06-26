import {
  InstitutionPlanCard,
  PmePlanCard,
} from "@/components/billing/pricing-plan-card";
import { PlanUpdateActions } from "@/components/admin/plan-update-actions";
import type { InstitutionPlan, PmePlan } from "@/lib/pricing";
import type { PricingPlanAdminRow } from "@/lib/pricing-store";

type AdminPlanCardProps = {
  plan: InstitutionPlan | PmePlan;
  rawPlan: PricingPlanAdminRow;
  canUpdate: boolean;
  restrictionMessage?: string | null;
  variant: "institution" | "pme";
};

export function AdminPricingPlanCard({
  plan,
  rawPlan,
  canUpdate,
  restrictionMessage,
  variant,
}: AdminPlanCardProps) {
  const footer = (
    <PlanUpdateActions
      plan={rawPlan}
      canUpdate={canUpdate}
      restrictionMessage={restrictionMessage}
    />
  );

  if (variant === "institution") {
    return (
      <InstitutionPlanCard
        plan={plan as InstitutionPlan}
        footer={footer}
      />
    );
  }

  return <PmePlanCard plan={plan as PmePlan} footer={footer} />;
}
