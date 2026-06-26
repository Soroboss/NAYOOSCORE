import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupProgress } from "@/components/signup/signup-progress";
import {
  SelectableInstitutionPlan,
  SelectablePmePlan,
} from "@/components/signup/plan-picker";
import { getCurrentUser, getLoginRedirectForUser } from "@/lib/auth";
import { loadInstitutionPlans, loadPmePlans } from "@/lib/pricing-store";
import {
  getCategoryTitle,
  isSignupCategory,
  isValidPlanForCategoryAsync,
  registerPath,
  type SignupPlanId,
} from "@/lib/signup-flow";

type PageProps = {
  searchParams: Promise<{ category?: string; plan?: string }>;
};

export default async function SignupPlansPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect(await getLoginRedirectForUser(user));
  }

  const { category: categoryParam, plan: planParam } = await searchParams;

  if (!isSignupCategory(categoryParam)) {
    redirect("/signup");
  }

  const category = categoryParam;

  if (planParam && (await isValidPlanForCategoryAsync(category, planParam))) {
    redirect(registerPath(category, planParam as SignupPlanId));
  }

  const pmePlans = await loadPmePlans();
  const institutionPlans = await loadInstitutionPlans();

  return (
    <div className="space-y-8">
      <SignupProgress currentStep="plan" />

      <div className="space-y-2 text-center sm:text-left">
        <Link
          href="/signup"
          className="text-sm text-[#0077B6] hover:underline"
        >
          ← Changer de profil
        </Link>
        <h1 className="text-2xl font-bold text-[#0B1D2A] sm:text-3xl">
          Choisissez votre forfait {getCategoryTitle(category)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {category === "institution"
            ? "Les PME que vous accompagnez sont incluses dans votre abonnement."
            : "Les PME rattachées à une institution partenaire bénéficient d'un accès gratuit."}
        </p>
      </div>

      <div
        className={`grid gap-4 ${
          category === "institution" ? "lg:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {category === "pme"
          ? pmePlans.map((plan) => (
              <SelectablePmePlan key={plan.id} plan={plan} />
            ))
          : institutionPlans.map((plan) => (
              <SelectableInstitutionPlan
                key={plan.id}
                plan={plan}
                category={category}
              />
            ))}
      </div>
    </div>
  );
}
