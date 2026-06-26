import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/forms/verify-email-form";
import {
  getAccessToken,
  isEmailVerifiedCookie,
} from "@/lib/auth-cookies";
import { getEmailVerifiedFromAuth, getLoginRedirectForUser } from "@/lib/auth";
import { createInsforgeServerClient } from "@/lib/insforge-server";

export default async function VerifyEmailPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect("/login");
  }

  let verified = await isEmailVerifiedCookie();
  if (!verified && token) {
    verified = await getEmailVerifiedFromAuth(token);
  }

  if (verified) {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (user) {
      redirect(await getLoginRedirectForUser(user));
    }
    redirect("/login");
  }

  const client = createInsforgeServerClient(token);
  const { data } = await client.auth.getCurrentUser();
  const email = data?.user?.email;

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1D2A]">
          Vérifiez votre email
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saisissez le code à 6 chiffres reçu par email
        </p>
      </div>
      <VerifyEmailForm email={email} />
    </div>
  );
}
