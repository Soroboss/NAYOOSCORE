import { redirect } from "next/navigation";
import { getCurrentUser, getLoginRedirectForUser } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(await getLoginRedirectForUser(user));
  }

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Connexion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accédez à votre espace Nayooscore
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
