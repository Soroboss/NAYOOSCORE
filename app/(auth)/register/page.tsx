import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getPmeRedirectPath, getRedirectPathForRole } from "@/lib/auth";
import type { UserRole } from "@/lib/constants";
import { RegisterForm } from "@/components/forms/register-form";
import { SignupProgress } from "@/components/signup/signup-progress";
import { formatXof } from "@/lib/format";
import {
  getCategoryTitle,
  getPlanLabel,
  getPlanMonthlyPrice,
  isSignupCategory,
  isValidPlanForCategory,
  signupPlansPath,
  type SignupCategory,
  type SignupPlanId,
} from "@/lib/signup-flow";
import { Building2, Briefcase, LineChart, Sparkles } from "lucide-react";

const pmePerks = [
  { icon: Briefcase, text: "Espace PME personnalisé selon votre activité" },
  { icon: LineChart, text: "Suivi CA, dépenses et trésorerie" },
  { icon: Sparkles, text: "Recommandations pour améliorer votre score" },
];

const institutionPerks = [
  { icon: Building2, text: "Portefeuille PME et scoring centralisé" },
  { icon: LineChart, text: "Programmes, cohortes et rapports" },
  { icon: Sparkles, text: "Workflow de décision financement" },
];

type PageProps = {
  searchParams: Promise<{ category?: string; plan?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (user) {
    const path =
      user.role === "PME_OWNER" || user.role === "PME_STAFF" || user.role === "VIEWER"
        ? await getPmeRedirectPath(user.id)
        : getRedirectPathForRole(user.role as UserRole);
    redirect(path);
  }

  const { category: categoryParam, plan: planParam } = await searchParams;

  if (!isSignupCategory(categoryParam) || !isValidPlanForCategory(categoryParam, planParam)) {
    redirect("/signup");
  }

  const category = categoryParam as SignupCategory;
  const plan = planParam as SignupPlanId;
  const perks = category === "pme" ? pmePerks : institutionPerks;
  const monthlyPrice = getPlanMonthlyPrice(category, plan);
  const planLabel = getPlanLabel(category, plan);

  return (
    <div className="space-y-8">
      <SignupProgress currentStep="register" />

      <div className="space-y-2 text-center sm:text-left">
        <Link
          href={signupPlansPath(category)}
          className="text-sm text-[#0077B6] hover:underline"
        >
          ← Changer de forfait
        </Link>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#00BFA6]">
          {getCategoryTitle(category)} · {planLabel}
        </p>
        <h1 className="text-2xl font-bold text-[#0B1D2A] sm:text-3xl">
          {category === "pme"
            ? "Créez votre compte entrepreneur"
            : "Créez votre espace institution"}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Forfait sélectionné :{" "}
          <strong className="text-[#0B1D2A]">
            {planLabel} — {monthlyPrice === 0 ? "Gratuit" : `${formatXof(monthlyPrice)}/mois`}
          </strong>
        </p>
      </div>

      <ul className="grid gap-3 rounded-xl border border-[#00BFA6]/20 bg-[#00BFA6]/5 p-4">
        {perks.map((perk) => (
          <li key={perk.text} className="flex items-start gap-3 text-sm text-[#0B1D2A]/85">
            <perk.icon className="mt-0.5 size-4 shrink-0 text-[#00BFA6]" />
            {perk.text}
          </li>
        ))}
      </ul>

      <RegisterForm category={category} plan={plan} />
    </div>
  );
}
