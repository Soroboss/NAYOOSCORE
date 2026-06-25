import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-2">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Mot de passe oublié</h1>
        <p className="text-sm text-white/60">
          Recevez un lien pour réinitialiser votre accès
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
