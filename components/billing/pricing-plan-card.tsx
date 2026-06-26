import { formatXof } from "@/lib/format";
import type { InstitutionPlan, PmePlan } from "@/lib/pricing";
import { Check } from "lucide-react";

type InstitutionPlanCardProps = {
  plan: InstitutionPlan;
  compact?: boolean;
};

export function InstitutionPlanCard({ plan, compact }: InstitutionPlanCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
        plan.highlighted
          ? "border-[#00BFA6] ring-2 ring-[#00BFA6]/20"
          : "border-[#0B1D2A]/10"
      }`}
    >
      {plan.highlighted && (
        <span className="mb-3 w-fit rounded-full bg-[#00BFA6]/10 px-3 py-1 text-xs font-semibold text-[#00BFA6]">
          Recommandé
        </span>
      )}
      <h3 className="text-lg font-bold text-[#0B1D2A]">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
      <div className="mt-4">
        <span className="text-3xl font-bold text-[#0B1D2A]">
          {formatXof(plan.monthlyPrice)}
        </span>
        <span className="text-sm text-muted-foreground"> / mois</span>
      </div>
      {!compact && (
        <p className="mt-1 text-xs text-muted-foreground">
          ou {formatXof(plan.yearlyPrice)} / an (−20 %)
        </p>
      )}
      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#0B1D2A]/85">
            <Check className="mt-0.5 size-4 shrink-0 text-[#00BFA6]" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PmePlanCard({ plan }: { plan: PmePlan }) {
  return (
    <div className="rounded-xl border border-dashed border-[#0B1D2A]/15 bg-[#F5F7FA]/50 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-[#0B1D2A]">{plan.name}</h3>
        <span className="text-sm font-bold text-[#0077B6]">
          {plan.monthlyPrice === 0 ? "Gratuit" : `${formatXof(plan.monthlyPrice)}/mois`}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{plan.forWhom}</p>
      <ul className="mt-3 space-y-1">
        {plan.features.map((f) => (
          <li key={f} className="text-xs text-muted-foreground">
            • {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
