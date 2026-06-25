import { redirect } from "next/navigation";
import { getCurrentUser, getPmeRedirectPath, getRedirectPathForRole } from "@/lib/auth";
import type { UserRole } from "@/lib/constants";
import { RegisterForm } from "@/components/forms/register-form";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    const path =
      user.role === "PME_OWNER" || user.role === "PME_STAFF" || user.role === "VIEWER"
        ? await getPmeRedirectPath(user.id)
        : getRedirectPathForRole(user.role as UserRole);
    redirect(path);
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
