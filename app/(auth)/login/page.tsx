import { redirect } from "next/navigation";
import { getCurrentUser, getLoginRedirectForUser } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";

type PageProps = {
  searchParams: Promise<{
    insforge_status?: string;
    insforge_type?: string;
    insforge_error?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect(await getLoginRedirectForUser(user));
  }

  const params = await searchParams;
  const emailVerifiedSuccess =
    params.insforge_status === "success" && params.insforge_type === "verify_email";
  const emailVerifyError =
    params.insforge_status === "error" && params.insforge_type === "verify_email";

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Connexion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accédez à votre espace Nayooscore
        </p>
      </div>

      {emailVerifiedSuccess && (
        <p className="mb-4 rounded-lg border border-[#00BFA6]/30 bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#00775a]">
          Email vérifié avec succès. Connectez-vous avec votre mot de passe.
        </p>
      )}

      {emailVerifyError && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {params.insforge_error ?? "La vérification email a échoué. Réessayez ou contactez le support."}
        </p>
      )}

      <LoginForm />
    </div>
  );
}
