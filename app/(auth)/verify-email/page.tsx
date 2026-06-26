import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/forms/verify-email-form";
import {
  getAccessToken,
  isEmailVerifiedCookie,
} from "@/lib/auth-cookies";
import { getEmailVerifiedFromAuth } from "@/lib/auth";

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
    redirect("/pme/dashboard");
  }

  return (
    <div className="space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1D2A]">
          Vérifiez votre email
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sécurité du compte — confirmation requise avant accès
        </p>
      </div>
      <VerifyEmailForm />
    </div>
  );
}
