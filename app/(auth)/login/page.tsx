import { redirect } from "next/navigation";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectPathForRole(user.role));
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
