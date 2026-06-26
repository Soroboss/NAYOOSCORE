import Link from "next/link";
import { BILLING_MODEL, INSTITUTION_PLANS, PME_PLANS } from "@/lib/pricing";
import { formatXof } from "@/lib/format";
import { signupPlansPath } from "@/lib/signup-flow";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section id="tarifs" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00BFA6]">
            Tarifs
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#0B1D2A] md:text-4xl">
            {BILLING_MODEL.headline}
          </h2>
          <p className="mt-4 text-muted-foreground">{BILLING_MODEL.summary}</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-[#0B1D2A]">Offres institution</h3>
            <Button asChild variant="outline" size="sm">
              <Link href={signupPlansPath("institution")}>
                S&apos;inscrire en tant qu&apos;institution
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {INSTITUTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-6 ${
                  plan.highlighted
                    ? "border-[#00BFA6] bg-[#00BFA6]/5 shadow-lg ring-2 ring-[#00BFA6]/20"
                    : "border-[#0B1D2A]/10 bg-[#F5F7FA]/30"
                }`}
              >
                {plan.highlighted && (
                  <span className="mb-3 w-fit rounded-full bg-[#00BFA6]/15 px-3 py-1 text-xs font-semibold text-[#00BFA6]">
                    Le plus populaire
                  </span>
                )}
                <h4 className="text-lg font-bold text-[#0B1D2A]">{plan.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-4 text-3xl font-bold text-[#0B1D2A]">
                  {formatXof(plan.monthlyPrice)}
                  <span className="text-base font-normal text-muted-foreground">/mois</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#0B1D2A]/80">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#00BFA6]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/signup/plans?category=institution&plan=${plan.id}`}
                  className={`mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                    plan.highlighted
                      ? "bg-[#00BFA6] hover:bg-[#00a892]"
                      : "bg-[#0077B6] hover:bg-[#00629a]"
                  }`}
                >
                  Choisir {plan.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-dashed border-[#0B1D2A]/15 bg-[#F5F7FA]/50 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#0B1D2A]">Offres PME (inscription directe)</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Gratuit si vous êtes accompagné par une institution partenaire.
              </p>
            </div>
            <Button asChild size="sm" className="bg-[#00BFA6] text-white hover:bg-[#00a892]">
              <Link href={signupPlansPath("pme")}>
                S&apos;inscrire en tant que PME
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PME_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#0B1D2A]">{plan.name}</h4>
                  <span className="font-bold text-[#0077B6]">
                    {plan.monthlyPrice === 0
                      ? "Gratuit"
                      : `${formatXof(plan.monthlyPrice)}/mois`}
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
                <Link
                  href={`/register?category=pme&plan=${plan.id}`}
                  className="mt-4 inline-flex text-sm font-semibold text-[#00BFA6] hover:underline"
                >
                  Choisir ce forfait →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
