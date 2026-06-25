import { redirect } from "next/navigation";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth";
import { RegisterForm } from "@/components/forms/register-form";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectPathForRole(user.role));
  }

  return (
    <div className="space-y-2">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Inscription</h1>
        <p className="text-sm text-white/60">
          Créez votre compte entrepreneur PME
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
