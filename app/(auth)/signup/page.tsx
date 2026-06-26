import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupProgress } from "@/components/signup/signup-progress";
import { CategoryPicker } from "@/components/signup/category-picker";
import { getCurrentUser, getLoginRedirectForUser } from "@/lib/auth";
import { SIGNUP_CATEGORIES } from "@/lib/signup-flow";

export default async function SignupCategoryPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(await getLoginRedirectForUser(user));
  }

  return (
    <div className="space-y-8">
      <SignupProgress currentStep="category" />

      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#0B1D2A] sm:text-3xl">
          Vous êtes…
        </h1>
        <p className="text-sm text-muted-foreground">
          Choisissez votre profil pour voir les forfaits adaptés, puis créez votre compte.
        </p>
      </div>

      <CategoryPicker categories={SIGNUP_CATEGORIES} />

      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold text-[#0077B6] hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
