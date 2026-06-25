import { requireAuth } from "@/app/actions/auth";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { getCompanyForUser } from "@/lib/company-context";
import { canAccessPme } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function PmeOnboardingPage() {
  const user = await requireAuth(canAccessPme);
  const company = await getCompanyForUser(user.id);

  if (company?.onboarding_completed) {
    redirect("/pme/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">
          Bienvenue sur Nayooscore
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configurez votre entreprise pour activer les modules adaptés à votre activité.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
