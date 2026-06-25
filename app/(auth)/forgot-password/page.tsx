import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recevez un lien pour réinitialiser votre accès
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
