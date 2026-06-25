import { redirect } from "next/navigation";
import { getCurrentUser, getPmeRedirectPath, getRedirectPathForRole } from "@/lib/auth";
import type { UserRole } from "@/lib/constants";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage() {
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
        <h1 className="text-2xl font-semibold text-white">Connexion</h1>
        <p className="text-sm text-white/60">
          Accédez à votre espace Nayooscore
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
