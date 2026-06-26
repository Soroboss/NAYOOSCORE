import Link from "next/link";
import { formatXof } from "@/lib/format";
import type { InstitutionPlan, PmePlan } from "@/lib/pricing";
import { registerPath, type SignupCategory } from "@/lib/signup-flow";
import { Check, ArrowRight } from "lucide-react";

type SelectableInstitutionPlanProps = {
  plan: InstitutionPlan;
  category: SignupCategory;
};

export function SelectableInstitutionPlan({ plan, category }: SelectableInstitutionPlanProps) {
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
      <p className="mt-1 text-xs text-muted-foreground">
        ou {formatXof(plan.yearlyPrice)} / an (−20 %)
      </p>
      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#0B1D2A]/85">
            <Check className="mt-0.5 size-4 shrink-0 text-[#00BFA6]" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={registerPath(category, plan.id)}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${
          plan.highlighted
            ? "bg-[#00BFA6] hover:bg-[#00a892]"
            : "bg-[#0077B6] hover:bg-[#00629a]"
        }`}
      >
        Choisir {plan.name}
        <ArrowRight className="ml-2 size-4" />
      </Link>
    </div>
  );
}

type SelectablePmePlanProps = {
  plan: PmePlan;
};

export function SelectablePmePlan({ plan }: SelectablePmePlanProps) {
  const isFree = plan.monthlyPrice === 0;
  return (
    <div
      className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
        isFree ? "border-[#00BFA6]/30" : "border-[#0B1D2A]/10"
      }`}
    >
      <h3 className="text-lg font-bold text-[#0B1D2A]">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.forWhom}</p>
      <div className="mt-4">
        <span className="text-3xl font-bold text-[#0B1D2A]">
          {isFree ? "Gratuit" : formatXof(plan.monthlyPrice)}
        </span>
        {!isFree && <span className="text-sm text-muted-foreground"> / mois</span>}
      </div>
      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#0B1D2A]/85">
            <Check className="mt-0.5 size-4 shrink-0 text-[#00BFA6]" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={registerPath("pme", plan.id)}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#00BFA6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00a892]"
      >
        {isFree ? "Commencer gratuitement" : `Choisir ${plan.name}`}
        <ArrowRight className="ml-2 size-4" />
      </Link>
    </div>
  );
}
