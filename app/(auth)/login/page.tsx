import { redirect } from "next/navigation";
import { getCurrentUser, getLoginRedirectForUser } from "@/lib/auth";
import { getAccessToken, getRefreshToken } from "@/lib/auth-cookies";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { LoginForm } from "@/components/forms/login-form";

type PageProps = {
  searchParams: Promise<{
    insforge_status?: string;
    insforge_type?: string;
    insforge_error?: string;
    error?: string;
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedRedirect = getSafeRedirectPath(params.redirect, "");

  const user = await getCurrentUser();
  if (user) {
    const target = requestedRedirect || (await getLoginRedirectForUser(user));
    if (target) redirect(target);
  }

  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  if (!accessToken && refreshToken) {
    redirect(
      `/api/auth/refresh?redirect=${encodeURIComponent(requestedRedirect || "/")}`
    );
  }
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

      {params.error === "rate_limit" && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Trop de tentatives récentes. Attendez quelques minutes puis réessayez de vous
          connecter.
        </p>
      )}

      {params.error === "no_institution" && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Votre compte est actif mais l&apos;institution n&apos;a pas pu être finalisée.
          Contactez le support à +225 07 57 22 87 31 ou réinscrivez-vous.
        </p>
      )}

      {params.error === "session_expired" && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Session expirée. Reconnectez-vous avec votre mot de passe.
        </p>
      )}

      <LoginForm redirectTo={params.redirect} />
    </div>
  );
}
